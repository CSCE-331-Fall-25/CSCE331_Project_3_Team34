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
  const [selectedItemId, setselectedItemId] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [items, setItems] = useState([]);
  const [selectionQueue, setSelectionQueue] = useState([]);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [activeSelection, setActiveSelection] = useState(null); // { type, label, remaining }
  const groupIdRef = useRef(0);

  const safeNumber = value => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const resolveDisplayPrice = item => {
    const hasPriceMod = item?.pricemod !== undefined && item?.pricemod !== null;
    if (hasPriceMod) {
      const modValue = safeNumber(item.pricemod);
      return { value: modValue, hide: modValue === 0 };
    }
    const baseValue = safeNumber(item?.price ?? item?.cost ?? 0);
    return { value: baseValue, hide: false };
  };

  const computeLinePrice = item => {
    const baseValue = safeNumber(item?.price ?? item?.cost ?? 0);
    const priceMod = safeNumber(item?.pricemod ?? 0);
    return baseValue + priceMod;
  };

  function addToOrder(item, overrides = {}) {
    setOrderItems(prev => [...prev, { ...item, ...overrides }]);
  }

  function removeFromOrder(idx) {
    setOrderItems(prev => {
      const target = prev[idx];
      if (!target) return prev;
      if (target.isParent && target.groupId != null) {
        return prev.filter(entry => entry.groupId !== target.groupId);
      }
      return prev.filter((_, i) => i !== idx);
    });
  }

  function clearOrder() {
    setOrderItems([]);
    setCurrentGroupId(null);
    setSelectionQueue([]);
    setActiveSelection(null);
    setMenuItems([]);
    setselectedItemId('');
  }
  
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

      // Keep the item objects so we can use every property (name, price, etc.).
      const normalized = Array.isArray(data)
        ? data.map((d, idx) => (
            typeof d === 'string'
              ? { name: d, itemid: `item-${idx}`, price: 0 }
              : d
          ))
        : [];
      setItems(normalized);
    } catch (err) {
      console.error('fetch failed', err);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  async function getMenuByType(type) {
    try {
      const q = encodeURIComponent(type);
      const res = await fetch(`/api/kiosk/get-menu?type=${q}`);
      if (!res.ok) throw new Error('Failed to load menu');
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMenuItems([]);
    }
  }

  function buildSelectionQueue(item) {
    if (!item) return [];
    const queue = [];
    if (item.type === 'meal') {
      const entreeCount = Number(item.numentrees ?? 0);
      const sideCount = Number(item.numsides ?? 0);
      for (let i = 0; i < entreeCount; i++) {
        queue.push({ type: 'entree', label: `Entree ${i + 1}` });
      }
      for (let i = 0; i < sideCount; i++) {
        queue.push({ type: 'side', label: `Side ${i + 1}` });
      }
    } else if (item.type === 'a la carte') {
      queue.push({ type: 'a la carte', label: 'A La Carte' });
    } else {
      queue.push({ type: item.type, label: item.name || item.type });
    }
    return queue;
  }

  async function startNextSelection(queueOverride) {
    const queueSource = queueOverride ?? selectionQueue;
    if (!queueSource.length) {
      setSelectionQueue([]);
      setActiveSelection(null);
      setMenuItems([]);
      setselectedItemId('');
      setCurrentGroupId(null);
      return;
    }
    const [next, ...rest] = queueSource;
    setSelectionQueue(rest);
    setActiveSelection({ ...next, remaining: rest.length });
    await getMenuByType(next.type);
  }

  async function handleItemSelection(item) {
    const newGroupId = groupIdRef.current + 1;
    groupIdRef.current = newGroupId;
    addToOrder(item, { groupId: newGroupId, isParent: true });
    setCurrentGroupId(newGroupId);
    setselectedItemId(item.itemid);
    const queue = buildSelectionQueue(item);
    setSelectionQueue(queue);
    await startNextSelection(queue);
  }

  async function handleMenuChoice(option) {
    if (currentGroupId != null) {
      addToOrder(option, { groupId: currentGroupId, isParent: false });
    } else {
      addToOrder(option);
    }
    if (selectionQueue.length === 0) {
      setActiveSelection(null);
      setMenuItems([]);
      setCurrentGroupId(null);
      setselectedItemId('');
      return;
    }
    await startNextSelection();
  }

  const total = orderItems.reduce((s, it) => s + computeLinePrice(it), 0);

  return (
    <div className="kiosk-root">
      <div className="kiosk-left">
        <div className="kiosk-type-list">
          {items.map((item, idx) => {
            const currItemId = item.itemid;
            const basePrice = safeNumber(item.price ?? item.cost ?? 0);
            return (
              <button
                key={item.itemid}
                className={`kiosk-type-btn ${selectedItemId === currItemId ? 'active' : ''}`}
                onClick={() => handleItemSelection(item)}
              >
                <div className="kiosk-type-name">{item.name || currItemId}</div>
                <div className="kiosk-item-price">${basePrice.toFixed(2)}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="kiosk-middle">
        {!selectedItemId && (
          <div className="kiosk-empty">Choose a category from the left to view items</div>
        )}
        {selectedItemId && (
          <>
            {activeSelection && (
              <div className="kiosk-selection-banner">
                Select {activeSelection.label || activeSelection.type}
                {typeof activeSelection.remaining === 'number' && activeSelection.remaining > 0 && (
                  <span className="kiosk-selection-remaining"> ({activeSelection.remaining} more after this)</span>
                )}
              </div>
            )}
            <div className="kiosk-items-grid">
              {menuItems.length === 0 && <div className="kiosk-empty">No items</div>}
              {menuItems.map(it => {
                const { value, hide } = resolveDisplayPrice(it);
                return (
                  <div key={it.id ?? it.menuid ?? it.name} className="kiosk-item">
                    <div className="kiosk-item-name">{it.name}</div>
                    <div className="kiosk-item-price">{hide ? '' : `$${value.toFixed(2)}`}</div>
                    <button className="kiosk-add-btn" onClick={() => handleMenuChoice(it)}>Add</button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="kiosk-right">
        <h3 className="kiosk-title">Current Order</h3>
        <div className="kiosk-order-list">
          {orderItems.length === 0 && <div className="kiosk-empty">No items yet</div>}
          {orderItems.map((it, idx) => {
            const { value, hide } = resolveDisplayPrice(it);
            return (
              <div className="kiosk-order-row" key={idx}>
                <div className="kiosk-order-name">{it.name}</div>
                <div className="kiosk-order-actions">
                  <div className="kiosk-order-price">{hide ? '' : `$${value.toFixed(2)}`}</div>
                  <button className="kiosk-remove-btn" onClick={() => removeFromOrder(idx)}>Remove</button>
                </div>
              </div>
            );
          })}
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