import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Transaction is a server-side class; don't import it into the client bundle.
import '../styles/Kiosk.css';

export default function Kiosk() {

  // --- inactivity timer --- //

  const navigate = useNavigate();
  const timerRef = useRef(null);

  function startTimer() {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => navigate('/weather'), 1000 * 60 * 10); // 10 minutes
  }

  useEffect(() => {
    const events = ['click', 'mousemove', 'scroll', 'touchstart'];
    function resetTimer() { startTimer(); }
    events.forEach(event => window.addEventListener(event, resetTimer, { passive: true }));
    startTimer();
    return () => {
      clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [navigate]);

  // --- UI state and handlers --- //
  const [transaction, setTransaction] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [items, setItems] = useState([]);

  async function fetchItems() {
    try {
      const res = await fetch('/api/kiosk/get-items');
      console.log('status', res.status, 'ok', res.ok);
      console.log('headers', Object.fromEntries(res.headers.entries()));

      // parse JSON body
      const data = await res.json();
      console.log('data', data);                    // inspect
      console.log(JSON.stringify(data, null, 2));  // nicely formatted
      if (Array.isArray(data)) console.table(data); // nice table for arrays

      // Server may return rows like { name: 'Bowl' } or simple strings.
      const normalized = Array.isArray(data)
        ? data.map(d => (typeof d === 'string' ? d : (d.name || d.type || JSON.stringify(d))))
        : [];
      setItems(normalized);
    } catch (err) {
      console.error('fetch failed', err);
    }
  }

  useEffect(() => {
    fetchItems();
    // initialize a lightweight client-side transaction object
    setTransaction({});
  }, []);

  // fetch menu items for a given type
  async function loadType(type) {
    setSelectedType(type);
    try {
      const q = encodeURIComponent(type);
      const res = await fetch(`/api/kiosk/get-items?type=${q}`);
      if (!res.ok) throw new Error('Failed to load menu');
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMenuItems([]);
    }
  }

  function addToOrder(item) {
    setOrderItems(prev => [...prev, item]);
  }

  function removeFromOrder(idx) {
    setOrderItems(prev => prev.filter((_, i) => i !== idx));
  }

  function clearOrder() {
    setOrderItems([]);
  }

  const total = orderItems.reduce((s, it) => s + (it.price || it.cost || 0), 0);

  useEffect(() => {
    
  }, []);

  return (
    <div className="kiosk-root">
      <div className="kiosk-left">
        <div className="kiosk-type-list">
          {items.map((t, i) => (
            <button key={`${t}-${i}`} className={`kiosk-type-btn ${selectedType === t ? 'active' : ''}`} onClick={() => loadType(t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="kiosk-middle">
        {!selectedType && (
          <div className="kiosk-empty">Choose a category from the left to view items</div>
        )}
        {selectedType && (
          <>
            <div className="kiosk-items-grid">
              {menuItems.length === 0 && <div className="kiosk-empty">No items</div>}
              {menuItems.map(it => (
                <div key={it.id} className="kiosk-item">
                  <div className="kiosk-item-name">{it.name}</div>
                  <div className="kiosk-item-price">${(it.price || it.cost || 0).toFixed(2)}</div>
                  <button className="kiosk-add-btn" onClick={() => addToOrder(it)}>Add</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="kiosk-right">
        <h3 className="kiosk-title">Current Order</h3>
        <div className="kiosk-order-list">
          {orderItems.length === 0 && <div className="kiosk-empty">No items yet</div>}
          {orderItems.map((it, idx) => (
            <div className="kiosk-order-row" key={idx}>
              <div className="kiosk-order-name">{it.name}</div>
              <div className="kiosk-order-actions">
                <div className="kiosk-order-price">${(it.price || it.cost || 0).toFixed(2)}</div>
                <button className="kiosk-remove-btn" onClick={() => removeFromOrder(idx)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div className="kiosk-order-summary">
          <div>Total: ${total.toFixed(2)}</div>
          <div className="kiosk-order-controls">
            <button onClick={clearOrder} className="kiosk-clear-btn">Clear</button>
            <button onClick={() => console.log('Proceed to checkout', orderItems)} className="kiosk-checkout-btn">Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
}