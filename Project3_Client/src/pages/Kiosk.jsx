import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import pandaLogo from '../assets/PandaLogo.svg'
import WeatherScreen from './WeatherScreen';
// Transaction is a server-side class; don't import it into the client bundle.
import '../styles/Kiosk.css';

import { getImageForItem } from "../assets/utils/imageMapper";
import ChatModal from '../Components/ChatModal';
import { saveOrder, loadOrder, clearOrder } from '../utils/orderPersistence';

export default function Kiosk() {

  // --- inactivity timer --- //

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const timerRef = useRef(null);

  function startTimer() {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => navigate('/weather'), 1000 * 60 * 10); // 10 minutes
  }

  const [tableColumns, setTableColumns] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [errorLabel, setErrorLabel] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [customerLoggedIn, setCustomerLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const getInventoryData = async () => {
    // console.log("inventory data");
    const response = await fetch("/api/inventory-data");
    if (!response.ok) {
      console.log("Error in function call");
      setErrorLabel("Failed to connect to backend");
    }
    else if (response == null) {
      console.log("Error getting data");
      setErrorLabel("Failed to connect to backend");
    }
    else {
      const newData = await response.json();
      //console.log(JSON.stringify(newData));
      setInventoryData(newData);
      setTableColumns([{ accessorKey: "inventoryid", header: "Inventory ID", cell: info => info.getValue() },
      { accessorKey: "name", header: "Name", cell: info => info.getValue() },
      { accessorKey: "quantity", header: "Quantity", cell: info => info.getValue() },
      { accessorKey: "minstock", header: "Minimum Stock", cell: info => info.getValue() },
      { accessorKey: "maxstock", header: "Maximum Stock", cell: info => info.getValue() }]);
      // console.log(JSON.stringify(newData));
      if (newData.error == -2) {
        setErrorLabel("Failed to connect to backend");
      }
      else if (newData.error == -1) {
        setErrorLabel("Error getting inventory items");
      }
      else if (newData.error == 0) {
        setErrorLabel("No inventory items");
      }
      setTableData(Array.isArray(newData) ? newData.slice() : [newData]);
    }
  }

  useEffect(() => {
    getInventoryData();

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
  const [orderFinalized, setOrderFinalized] = useState(false);
  
  const timeoutRef = useRef(null);

  const changeState = (newState) => {
    setState(newState);
  }

  // size modifiers fetched from server grouped by type (lowercased)
  const [sizeModsByType, setSizeModsByType] = useState({});
  const [pendingSizeSelection, setPendingSizeSelection] = useState(null);

  const getSizeOptionsForType = type => {
    const normalized = (type || '').toLowerCase();
    return sizeModsByType[normalized] ?? [];
  };

  async function fetchSizeMods() {
    try {
      const res = await fetch('/api/kiosk/get-sizes');
      if (!res.ok) throw new Error('Failed to load size modifiers');
      const data = await res.json();
      if (!Array.isArray(data)) { setSizeModsByType({}); return; }
      const grouped = data.reduce((acc, row, idx) => {
        const typeKey = String(row.type ?? row.name ?? '').toLowerCase();
        if (!typeKey) return acc;
        const sizeLabelRaw = row.size ?? row.label ?? row.name ?? `size-${idx}`;
        const sizeKey = String(sizeLabelRaw).toLowerCase();
        const displayLabel = typeof sizeLabelRaw === 'string' ? (sizeLabelRaw.charAt(0).toUpperCase() + sizeLabelRaw.slice(1)) : String(sizeLabelRaw);
        const entry = { key: sizeKey, label: displayLabel, priceDelta: safeNumber(row.pricemod ?? row.price ?? row.cost ?? 0) };
        if (!acc[typeKey]) acc[typeKey] = [];
        // avoid duplicate keys
        if (!acc[typeKey].some(e => e.key === entry.key)) acc[typeKey].push(entry);
        return acc;
      }, {});
      setSizeModsByType(grouped);
    } catch (err) {
      console.error('Failed to load size modifiers', err);
      setSizeModsByType({});
    }
  }

  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  const [showChat, setShowChat] = useState(false);


  const safeNumber = value => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getSizeContextForChoice = (option) => {
    if (!activeSelection) return null;
    const selectionType = (activeSelection.type || '').toLowerCase();
    const optionType = (option?.type || '').toLowerCase();
    const priceModValue = safeNumber(option?.pricemod ?? 0);

    const buildContext = (key, labelOverride) => {
      const options = getSizeOptionsForType(key);
      if (!options.length) return null;
      return { sizeGroup: key, label: labelOverride || key, options };
    };

    if (selectionType === 'drink') {
      return buildContext('drink', 'Drink');
    }

    if (selectionType === 'a la carte') {
      if (priceModValue > 0) {
        const premium = buildContext('premium', 'Premium');
        if (premium) return premium;
      }
      if (optionType === 'entree') {
        return buildContext('entree', 'Entree');
      }
      if (optionType === 'side') {
        return buildContext('side', 'Side');
      }
      return null;
    }

    return null;
  };

  const resolveDisplayPrice = item => {
    const hasPriceMod = item?.pricemod !== undefined && item?.pricemod !== null;
    let allergies = item.allergies;
    let hideAllergies = item.allergies == "NA";
    if (hasPriceMod) {
      const modValue = safeNumber(item.pricemod);
      return { value: modValue, hide: modValue === 0, allergies: allergies, hideAllergies: hideAllergies };
    }
    const baseValue = safeNumber(item?.price ?? item?.cost ?? 0);
    return { value: baseValue, hide: false, allergies: allergies, hideAllergies: hideAllergies };
  };

  const computeLinePrice = item => {
    const baseValue = safeNumber(item?.price ?? item?.cost ?? 0);
    const priceMod = safeNumber(item?.pricemod ?? 0);
    const sizeMod = safeNumber(item?.sizePriceMod ?? 0);
    return baseValue + priceMod + sizeMod;
  };

  function addToOrder(item, overrides = {}, insertAt = null) {
    setOrderItems(prev => {
      const entry = { ...item, ...overrides };
      const newOrder = insertAt == null || insertAt < 0 || insertAt > prev.length
        ? [...prev, entry]
        : [...prev.slice(0, insertAt), entry, ...prev.slice(insertAt)];
      saveOrder(newOrder, 'kiosk');
      return newOrder;
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
        saveOrder(nextOrder, 'kiosk');
        return nextOrder;
      }
      const nextOrder = prev.filter((_, i) => i !== idx);
      saveOrder(nextOrder, 'kiosk');
      return nextOrder;
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
    setPendingSizeSelection(null);
  }

  function clearOrderAndUI() {
    setOrderItems([]);
    clearUI();
    clearOrder('kiosk');
  }
  
  async function fetchItems() {
    try {
      const res = await fetch('/api/kiosk/get-items');
      // console.log('status', res.status, 'ok', res.ok);
      // console.log('headers', Object.fromEntries(res.headers.entries()));

      // parse JSON body
      const data = await res.json();
      // console.log('data', data);                    // inspect
      // console.log(JSON.stringify(data, null, 2));  // nicely formatted
      // if (Array.isArray(data)) console.table(data); // nice table for arrays

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

  async function getNextTransactionNum() {
    try {
      const res = await fetch('/api/kiosk/get-next-transaction-number');
    }
    catch (err) {
      console.error('fetch failed', err);
    }
  }

  useEffect(() => {
    fetchItems();
    getNextTransactionNum();
    fetchSizeMods();
    
    // Load saved order
    const savedOrder = loadOrder('kiosk');
    if (savedOrder.length > 0) {
      setOrderItems(savedOrder);
    }
    
    // Handle login success
    const success = searchParams.get('success');
    if (success == '4') {
      setCustomerLoggedIn(true);
      // Fetch customer data
      fetch('/api/get-user', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setCustomerName(data.user.username);
          }
        })
        .catch((err) => console.error('Failed to fetch customer data:', err));
      alert('Customer logged in successfully');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (success == '2') {
      navigate('/hub');
    } else if (success) {
      // Clear any other success params
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  async function fetchMenuRowsByType(type) {
    if (!type) return [];
    const q = encodeURIComponent(type);
    const res = await fetch(`/api/kiosk/get-menu?type=${q}`);
    if (!res.ok) throw new Error(`Failed to load menu for ${type}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  async function getMenuByType(type) {
    const normalized = (type || '').toLowerCase();
    if (!normalized) {
      setMenuItems([]);
      return;
    }
    try {
      if (normalized === 'a la carte') {
        const results = await Promise.allSettled([
          fetchMenuRowsByType('entree'),
          fetchMenuRowsByType('side'),
        ]);
        const combined = [];
        const seen = new Set();
        results.forEach(result => {
          if (result.status !== 'fulfilled' || !Array.isArray(result.value)) return;
          result.value.forEach(item => {
            if (!item) return;
            const key = item.menuid ?? item.id ?? (item.name ? `name-${item.name}` : `idx-${combined.length}`);
            if (seen.has(key)) return;
            seen.add(key);
            combined.push(item);
          });
        });
        setMenuItems(combined);
        return;
      }
      const data = await fetchMenuRowsByType(type);
      setMenuItems(data);
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

  function handleMenuTileClick(option) {
    if (!activeSelection) {
      handleMenuChoice(option);
      return;
    }
    const sizeContext = getSizeContextForChoice(option);
    if (sizeContext && sizeContext.options.length) {
      setPendingSizeSelection({
        option,
        sizeOptions: sizeContext.options,
        selectionLabel: activeSelection.label || activeSelection.type,
        sizeCategory: sizeContext.label,
      });
      return;
    }
    handleMenuChoice(option);
  }

  function cancelSizeSelection() {
    setPendingSizeSelection(null);
  }

  function confirmSizeSelection(sizeOpt) {
    if (!pendingSizeSelection) return;
    handleMenuChoice(pendingSizeSelection.option, sizeOpt);
    setPendingSizeSelection(null);
  }

  async function handleMenuChoice(option, explicitSize = null) {

    //DEBUG:
    // const inventoryIDs = option.inventoryids;
    // console.log("Selected menu Inventory:", inventoryIDs.join(", "));

    // for (const invID of inventoryIDs) {
    //   console.log(invID + ": " + inventoryData.find(item => item.inventoryid === invID)?.quantity);
    // }


    const pendingSwap = swapTargetRef.current;
    let insertAt = null;
    if (pendingSwap && pendingSwap.groupId === currentGroupId) {
      insertAt = pendingSwap.index;
    }

    const sizeContext = getSizeContextForChoice(option);
    const sizeOptions = sizeContext?.options ?? [];
    const selectedSize = explicitSize ?? (sizeOptions.length ? sizeOptions[0] : null);
    const sizePayload = selectedSize ? { sizeLabel: selectedSize.label, sizeKey: selectedSize.key, sizePriceMod: selectedSize.priceDelta } : {};

    if (currentGroupId != null) {
      addToOrder(option, {
        groupId: currentGroupId,
        isParent: false,
        parentItemId: currentParentItemIdRef.current,
        type: activeSelection?.type,
        ...sizePayload
      }, insertAt);
    } else {
      addToOrder(option, { ...sizePayload }, insertAt);
    }

    if (pendingSwap) {
      swapTargetRef.current = null;
    }

    if (selectionQueue.length === 0) {
      // Meal is complete - send to backend
      await sendCompletedMealToBackend();
      
      setActiveSelection(null);
      setMenuItems([]);
      setCurrentGroupId(null);
      setSelectedItemId('');
      currentParentItemIdRef.current = null;
      return;
    }
    await startNextSelection();
  }

  async function sendCompletedMealToBackend() {
    if (currentGroupId == null) return;
    
    // Find all items in the current group
    const groupItems = orderItems.filter(item => item.groupId === currentGroupId);
    const parentItem = groupItems.find(item => item.isParent);
    
    if (!parentItem) {
      console.error('No parent item found for group:', currentGroupId);
      return;
    }

    // Separate entrees and sides
    const entreeList = groupItems
      .filter(item => !item.isParent && item.type === 'entree')
      .map(item => item.name);
    
    const sideList = groupItems
      .filter(item => !item.isParent && item.type === 'side')
      .map(item => item.name);

    try {
      const res = await fetch('/api/buy-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          itemID: parentItem.name,
          entreeList,
          sideList,
          size: null
        })
      });
      
      const data = await res.json();
      if (data.success) {
        console.log('Item added to backend transaction:', data);
      } else {
        console.error('Failed to add item to backend:', data);
      }
    } catch (err) {
      console.error('Error sending item to backend:', err);
    }
  }

  const total = orderItems.reduce((s, it) => s + computeLinePrice(it), 0);

  async function handlePurchase() {
    // Move to Checkout screen; actual purchase should occur after payment
    if (orderItems.length === 0 || selectionQueue.length > 0 || activeSelection) {
      return;
    }
    changeState("Checkout");
  }

  function handlePayment(method) {
    // console.log("Payment method selected: " + method);
    // Perform purchase on payment confirmation, wait for server transaction id,
    // then show Finished screen so `transactionNumber` is available.
    (async () => {
      try {
        const res = await fetch('/api/purchase', { method: 'POST', credentials: 'include' });
        const data = await res.json();
        if (data && data.success) {
          if (data.transactionId) setTransactionNumber(Number(data.transactionId));
        } else {
          console.error('Purchase failed:', data);
        }
      } catch (err) {
        console.error('Error during purchase:', err);
      }

      changeState("Finished");

      timeoutRef.current = setTimeout(() => {
        goBackToKiosk(); 
      }, 5000);
    })();
  }

  function goBackToKiosk() {
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    clearOrderAndUI();
    changeState("Kiosk");
    navigate('/weather');
    setOrderFinalized(false);
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
                  const { value, hide, allergies, hideAllergies } = resolveDisplayPrice(it);

                  let isInStock = true;
                  const inventoryIDs = it.inventoryids;

                  for (const invID of inventoryIDs) {
                    if(inventoryData.find(item => item.inventoryid === invID)?.quantity < inventoryData.find(item => item.inventoryid === invID)?.minstock) isInStock = false;
                  }

                  let imageClass = isInStock ? 'kiosk-menu-image' : 'kiosk-menu-image out-of-stock';

                  let imgSrc = getImageForItem(it.name);
                  let boxStyle = `kiosk-item kisok-item-button${!isInStock ? ' out-of-stock' : ''}${!imgSrc ? ' no-img' : ''}`;

                  return (
                    <div
                      key={it.id ?? it.menuid ?? it.name}
                      role="button"
                      tabIndex={0}
                      className={boxStyle}
                      onClick={() => { if (isInStock) handleMenuTileClick(it); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' && isInStock) handleMenuTileClick(it); }}
                    >
                      {imgSrc && (
                        <img
                          src={getImageForItem(it.name)}
                          alt={it.name || 'item'}
                          className='kiosk-menu-image'
                        />
                      )}
                      <div className="kiosk-item-name">{it.name}</div>
                      <div className="kiosk-item-price">{hide ? '' : `$${value.toFixed(2)}`}</div>
                      <div className="kiosk-item-calories">{it.calories ? `${it.calories} calories` : '0 calories'}</div>
                      <div className="kiosk-item-calories">{hideAllergies ? '' : `${allergies}`}</div>
                    </div>
                  );
                })}
              </div>
              {pendingSizeSelection && (
                <div className="kiosk-size-modal-backdrop">
                  <div className="kiosk-size-modal">
                    <div className="kiosk-size-modal-title">
                      Choose a size for {pendingSizeSelection.option?.name}
                    </div>
                    <div className="kiosk-size-modal-subtitle">
                      {pendingSizeSelection.selectionLabel || 'Selection'} requires a size.
                    </div>
                    {pendingSizeSelection.sizeCategory && (
                      <div className="kiosk-size-modal-subtitle secondary">
                        {pendingSizeSelection.sizeCategory} options
                      </div>
                    )}
                    <div className="kiosk-size-modal-options">
                      {pendingSizeSelection.sizeOptions.map(opt => (
                        <button
                          key={opt.key}
                          type="button"
                          className="kiosk-size-btn"
                          onClick={() => confirmSizeSelection(opt)}
                        >
                          <span className="kiosk-size-label">{opt.label}</span>
                          {opt.priceDelta ? (
                            <span className="kiosk-size-price">+${opt.priceDelta.toFixed(2)}</span>
                          ) : (
                            <span className="kiosk-size-price">Included</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <button type="button" className="kiosk-size-cancel" onClick={cancelSizeSelection}>Cancel</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="kiosk-right">
          {customerLoggedIn && customerName && (
            <div className="kiosk-customer-info">
              <h3>Welcome, {customerName}!</h3>
            </div>
          )}
          <h3 className="kiosk-title">Current Order</h3>
          <div className="kiosk-order-list">
            {orderItems.length === 0 && <div className="kiosk-empty">No items yet</div>}
            {orderItems.map((it, idx) => {
              const { value, hide } = resolveDisplayPrice(it);
              const rowClass = `kiosk-order-row${it.isParent ? ' kiosk-order-row-parent' : (value > 0) ? ' kiosk-order-row-child-premium' : ' kiosk-order-row-child-default'}`;
              const hasSizeMod = it.sizePriceMod !== undefined && it.sizePriceMod !== null;
              const sizeModValue = hasSizeMod ? safeNumber(it.sizePriceMod) : 0;
              const sizeModLabel = hasSizeMod ? `${sizeModValue >= 0 ? '+' : '-'}$${Math.abs(sizeModValue).toFixed(2)}` : '';
              const priceLabel = hasSizeMod ? sizeModLabel : (hide ? '' : `$${value.toFixed(2)}`);
              return (
                <div className={rowClass} key={idx}>  
                  <div className="kiosk-order-name">
                    <span>{it.name}</span>
                    {it.sizeLabel && (
                      <span className="kiosk-order-size-note">
                        {it.sizeLabel}
                        {hasSizeMod && ` (${sizeModLabel})`}
                      </span>
                    )}
                  </div>
                  <div className="kiosk-order-actions">
                    <div className="kiosk-order-price">{priceLabel}</div>
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
              <button onClick={clearOrderAndUI} className="kiosk-clear-btn">Clear</button>
              <button onClick={() => {console.log('Proceed to checkout', orderItems); handlePurchase();}} className="kiosk-checkout-btn">Checkout</button>
            </div>
          </div>
        </div>
        <button
            className={`ai-chat-btn ${!open ? 'pulse' : 'fadeIn'}`} // change open --> isChatOpen
            onClick={() => setShowChat(true)}
          >
            <img src={getImageForItem('bobrosspanda')} alt="Bob Ross Panda" className='ai-chat-img'/>
        </button>
        <button
          className="kiosk-signin-btn"
          onClick={() => customerLoggedIn ? (setCustomerLoggedIn(false), setCustomerName('')) : navigate('/login?returnTo=/kiosk&functionality=3')}>
          {customerLoggedIn ? 'Sign Out' : 'Customer Sign In'}
        </button>
        <button
          className="kiosk-signin-btn"
          onClick={() => navigate('/login?returnTo=/hub&functionality=2')}>
          Employee Sign In
        </button>
        <button
          className="kiosk-help-btn"
          onClick={() => navigate('/weather')}>
          Back
        </button>
        {showChat && <ChatModal onClose={() => setShowChat(false)} />}
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