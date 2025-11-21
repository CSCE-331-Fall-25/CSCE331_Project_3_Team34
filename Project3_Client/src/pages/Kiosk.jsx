import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pandaLogo from '../assets/PandaLogo.svg'
// Transaction is a server-side class; don't import it into the client bundle.
import '../styles/Kiosk.css';

import { getImageForItem } from "../assets/utils/imageMapper";

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
  const [selectedItemId, setSelectedItemId] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [items, setItems] = useState([]);
  const [selectionQueue, setSelectionQueue] = useState([]);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [activeSelection, setActiveSelection] = useState(null); // { type, label, remaining }
  const groupIdRef = useRef(0);
  const currentParentItemIdRef = useRef(null);
  const swapTargetRef = useRef(null);

  const [state, setState] = useState("Kiosk"); // Possible states: "Kiosk", "Checkout", "Payment", "Receipt"
  const [transactionNumber, setTransactionNumber] = useState(0);
  
  const timeoutRef = useRef(null);

  const changeState = (newState) => {
    setState(newState);
  }

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

  function addToOrder(item, overrides = {}, insertAt = null) {
    setOrderItems(prev => {
      const entry = { ...item, ...overrides };
      if (insertAt == null || insertAt < 0 || insertAt > prev.length) {
        return [...prev, entry];
      }
      const next = [...prev];
      next.splice(insertAt, 0, entry);
      return next;
    });
  }

  function removeFromOrder(idx) {
    setOrderItems(prev => {
      const target = prev[idx];
      if (!target) return prev;
      if (target.isParent && target.groupId != null) {
        const nextOrder = prev.filter(entry => entry.groupId !== target.groupId);
        if (currentGroupId === target.groupId) {
          clearUI();
          currentParentItemIdRef.current = null;
          if (swapTargetRef.current?.groupId === target.groupId) {
            swapTargetRef.current = null;
          }
        }
        return nextOrder;
      }
      return prev.filter((_, i) => i !== idx);
    });
  }

  function removeGroupFromOrder(groupId) {
    if (groupId == null) return;
    setOrderItems(prev => prev.filter(entry => entry.groupId !== groupId));
    if (swapTargetRef.current?.groupId === groupId) {
      swapTargetRef.current = null;
    }
  }

  async function handleSwap(idx) {
    const target = orderItems[idx];
    if (!target || target.isParent) return;

    const parentEntry = orderItems.find(entry => entry.groupId === target.groupId && entry.isParent);
    const parentItemId = parentEntry?.itemid || target.parentItemId || '';

    setOrderItems(prev => prev.filter((_, i) => i !== idx));
    swapTargetRef.current = {
      index: idx,
      groupId: target.groupId ?? null,
      type: target.type,
      parentItemId,
    };

    if (!target.type) return;

    const label = target.type ? `Swap ${target.type}` : 'Swap Item';
    const swapQueue = [{ type: target.type, label }];

    setSelectionQueue(swapQueue);
    setActiveSelection(null);
    setMenuItems([]);
    setSelectedItemId(parentItemId);
    setCurrentGroupId(target.groupId ?? null);
    currentParentItemIdRef.current = parentItemId;

    await startNextSelection(swapQueue);
  }

  function clearUI() {
    setCurrentGroupId(null);
    setSelectionQueue([]);
    setActiveSelection(null);
    setMenuItems([]);
    setSelectedItemId('');
    currentParentItemIdRef.current = null;
    swapTargetRef.current = null;
  }

  function clearOrder() {
    setOrderItems([]);
    clearUI();
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
      setSelectedItemId('');
      setCurrentGroupId(null);
      currentParentItemIdRef.current = null;
      swapTargetRef.current = null;
      return;
    }
    const [next, ...rest] = queueSource;
    setSelectionQueue(rest);
    setActiveSelection({ ...next, remaining: rest.length });
    await getMenuByType(next.type);
  }

  async function handleItemSelection(item) {
    if (currentGroupId != null && (selectionQueue.length > 0 || activeSelection)) {
      removeGroupFromOrder(currentGroupId);
    }
    clearUI();

    const newGroupId = groupIdRef.current + 1;
    groupIdRef.current = newGroupId;
    currentParentItemIdRef.current = item.itemid;
    addToOrder(item, { groupId: newGroupId, isParent: true, parentItemId: item.itemid });
    setCurrentGroupId(newGroupId);
    setSelectedItemId(item.itemid);
    const queue = buildSelectionQueue(item);
    setSelectionQueue(queue);
    await startNextSelection(queue);
  }

  async function handleMenuChoice(option) {
    const pendingSwap = swapTargetRef.current;
    let insertAt = null;
    if (pendingSwap && pendingSwap.groupId === currentGroupId) {
      insertAt = pendingSwap.index;
    }

    if (currentGroupId != null) {
      addToOrder(option, {
        groupId: currentGroupId,
        isParent: false,
        parentItemId: currentParentItemIdRef.current,
      }, insertAt);
    } else {
      addToOrder(option, {}, insertAt);
    }

    if (pendingSwap) {
      swapTargetRef.current = null;
    }

    if (selectionQueue.length === 0) {
      setActiveSelection(null);
      setMenuItems([]);
      setCurrentGroupId(null);
      setSelectedItemId('');
      currentParentItemIdRef.current = null;
      return;
    }
    await startNextSelection();
  }

  const total = orderItems.reduce((s, it) => s + computeLinePrice(it), 0);

  async function handlePurchase() {
    changeState("Checkout");
    const res = await fetch('/api/kiosk/submit-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderData: orderItems }),
    });
    if (!res.ok) {
      console.error('Order submission failed');
    }
    // Dont clear order here
    //clearOrder(); 
  }

  function handlePayment(method) {
    console.log("Payment method selected: " + method);
    changeState("Finished");
    

    timeoutRef.current = setTimeout(() => {
      goBackToKiosk(); 
    }, 5000);
  }

  function goBackToKiosk() {
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    clearOrder();
    changeState("Kiosk");
    setOrderFinalized(false);
    navigate("/weather");   
  }

  return (
    <div>
      {(state == "Kiosk") && (
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
            <div className="kiosk-logo-wrapper">
              <img
                src={pandaLogo}
                alt="Panda Express"
                className="kiosk-logo"
              />
            </div>
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
                    <button
                      key={it.id ?? it.menuid ?? it.name}
                      type="button"
                      className="kiosk-item kiosk-item-button"
                      onClick={() => handleMenuChoice(it)}
                    >
                      <div className="kiosk-item-name">{it.name}</div>
                      <div className="kiosk-item-price">{hide ? '' : `$${value.toFixed(2)}`}</div>
                    </button>
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
              const rowClass = `kiosk-order-row${it.isParent ? ' kiosk-order-row-parent' : ' kiosk-order-row-child'}`;
              return (
                <div className={rowClass} key={idx}>
                  <div className="kiosk-order-name">{it.name}</div>
                  <div className="kiosk-order-actions">
                    <div className="kiosk-order-price">{hide ? '' : `$${value.toFixed(2)}`}</div>
                    {it.isParent ? (
                      <button className="kiosk-remove-btn" onClick={() => removeFromOrder(idx)}>
                        <img src={getImageForItem("trashcan")} alt="Remove" className="remove-icon" />
                      </button>
                    ) : (
                      <button className="kiosk-swap-btn" onClick={() => handleSwap(idx)}>
                        <img src={getImageForItem("swapArrows")} alt="Swap" className="swap-icon" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="kiosk-order-summary">
            <div>Total: ${total.toFixed(2)}</div>
            <div className="kiosk-order-controls">
              <button onClick={clearOrder} className="kiosk-clear-btn">Clear</button>
              <button onClick={() => {console.log('Proceed to checkout', orderItems); handlePurchase();}} className="kiosk-checkout-btn">Checkout</button>
            </div>
          </div>
        </div>
      </div>
      )} 
      {state == "Checkout" && (
        <div className="purchase-screen-wrapper">
          <div className="purchase-screen-card">

            <img src={pandaLogo} alt="Panda Express" className="purchase-logo" />

            {/* Top image */}
            <h4 className="purchase-screen-title">Select Payment Method</h4>
            <div className="purchase-screen-price">Total: ${total.toFixed(2)}</div>


            {/* Buttons section */}
            <div className="purchase-buttons">
              <div className="purchase-option" onClick={() => handlePayment("Cash")}>
                <img src={getImageForItem("cashImg")} alt="Cash" className="option-img" />
                <span className="option-text">Cash</span>
              </div>

              <div className="purchase-option" onClick={() => handlePayment("Card")}>
                <img src={getImageForItem("cardImg")} alt="Card" className="option-img" />
                <span className="option-text">Card</span>
              </div>

              <div className="purchase-option" onClick={() => handlePayment("Rewards")}>
                <img src={getImageForItem("rewardsImg")} alt="Rewards" className="option-img" />
                <span className="option-text">Rewards</span>
              </div>  
            </div>
          </div>
        </div>
      )}
      {state == "Finished" && (
        <div className="purchase-screen-wrapper">
          <div className="purchase-screen-card">

            <img src={getImageForItem("orderComplete")} alt="orderComplete" className="finished-img" />

            {/* Top image */}
            <h4 className="purchase-screen-title">Transaction: {transactionNumber} Complete!</h4>
            <div className="purchase-screen-price">Total: ${total.toFixed(2)}</div>

            <br></br>

            {/* Buttons section */} 
            <div className="finished-option" onClick={() => {
              setTransactionNumber(transactionNumber + 1);  
              goBackToKiosk();
              }}>
              New Order
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}