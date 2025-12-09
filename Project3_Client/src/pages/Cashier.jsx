import React, { useMemo, useContext } from "react";
import "../styles/Cashier/Cashier.css";
import "../styles/Cashier/DiscountModal.css";
import { useEffect, useState, useRef } from "react";

// don't import server code into the client bundle
// replace server-side debugging checks with a local flag
const debugging = false;
import { useNavigate, useSearchParams } from 'react-router-dom';

//components
import SignOutButton from "../Components/SignOut.jsx";
import DiscountModal from "../Components/DiscountModal.jsx";
import CashierCostTable from "../Components/CashierCostTable.jsx";
import ClearTransactionButton from "../Components/ClearTransactionButton.jsx";
import RemoveItemButton from "../Components/RemoveItemButton.jsx";
import PurchaseButton from "../Components/PurchaseButton.jsx";
import BuyItemButton from "../Components/BuyItemButton.jsx";
import VoidModal from "../Components/VoidModal.jsx";
import CreateMealModal from "../Components/CreateMealModal.jsx";
import SizeModal from "../Components/SizeModal.jsx";
import { saveOrder, loadOrder, clearOrder } from '../utils/orderPersistence';
import { useTranslatedObject } from "../hooks/useTranslatedText";
import { TranslationContext } from "../contexts/TranslationContext";
export default function Cashier() {
  const navigate = useNavigate();
  //newest Row reference for auto scrolling
  const lastRowRef = useRef(null);
  //handles selected row of items (used for removal/customization)
  const [selectedRow, setSelectedRow] = useState(null);

  //modal to confirm sign out
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showCreateMeal, setShowCreateMealModal] = useState(false);
  // modal mode handled in CreateMealModal
  const [customizingIndex, setCustomizingIndex] = useState(null); // Track which order is being customized

  // Discount buttons/state
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPriceOff, setDiscountPriceOff] = useState(0);

  //sizeModal
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  // pending callback for child components to receive the chosen size
  const [pendingSizeCallback, setPendingSizeCallback] = useState(null);
  const sizeOptions = ["Small", "Medium", "Large"]; //UPDATE BASED ON WHAT SIZES WE HAVE

  // --- Translation --- //
  const translationKeys = useMemo(() => ({
    'Discount': 'Discount',
    'Void': 'Void',
    'Sign Out': 'Sign Out',
    'Current Order': 'Current Order',
    'Subtotal': 'Subtotal',
    'DiscountLabel': 'Discount',
    'Tax': 'Tax',
    'Total': 'Total',
    'CUSTOMIZE': 'CUSTOMIZE',
    'A La Carte': 'A La Carte',
    'Appetizer': 'Appetizer',
    'Drink': 'Drink',
    'Bottle': 'Bottle',
    'Bowl': 'Bowl',
    'Plate': 'Plate',
    'Bigger': 'Bigger',
    'Family': 'Family',
    'Employee': 'Employee',
    'item': 'item',
    'items': 'items',
    'Cost': 'Cost',
    'Item': 'Item',
    'Language': 'Language'
  }), []);

  const translatedTexts = useTranslatedObject(translationKeys);
  const translationContext = useContext(TranslationContext);
  const selectedLanguage = translationContext?.selectedLanguage || 'en';
  const supportedLanguages = translationContext?.supportedLanguages || {};
  const setSelectedLanguage = translationContext?.setSelectedLanguage;
  const [translatedItemNames, setTranslatedItemNames] = useState({});

  //updates for orderTable
  const [currCost, setCurrCost] = useState(0);
  const [tax, setTax] = useState(0);
  const [priceTotal, setPriceTotal] = useState(0);
  const [transactionItems, setTransactionItems] = useState([]);
  const [rawOrders, setRawOrders] = useState([]);
  const [itemType, setItemType] = useState("NULL");
  // modal-specific state moved to CreateMealModal

  //Void modal
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

  //ManagerOverrideLogin
   const [searchParams] = useSearchParams();
   const sucessfulOverrideLogin = searchParams.get('success');
    const [tempManager, setTempManager] = useState(false);



    useEffect(() => {
      window.history.replaceState({}, '', window.location.pathname);

        // Guard against duplicate handling (React StrictMode / HMR can cause double mount)
        try {
          if (typeof window !== 'undefined' && window.__cashier_override_handled) return;
        } catch (e) {}

        // Always update page state when returning from login, regardless of success/failure
        if (sucessfulOverrideLogin) {
          UpdatePage();
        }

        if (sucessfulOverrideLogin == 2) {
          // mark handled to avoid duplicate alerts
          try { if (typeof window !== 'undefined') window.__cashier_override_handled = true; } catch (e) {}
          fetchUserData().then((data) => {
            if (data && data.success) {
              console.log("Fetched user data before Manager Override Login");
              console.log("Attempting Manager Override Login as " + (data.user || null));
              if(data.isManager){
                setTempManager(true);
                console.log("Manager Override Login Successful");
                setShowDiscountModal(true);
              }
              else{
                alert('Manager Override Login Failed: Not a Manager');
              }
            }
          });
        }
        console.log('sucessfulOverrideLogin param:', sucessfulOverrideLogin);
    }, [sucessfulOverrideLogin]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleBuildItem = (e) => {
    const id = e.target.id;
    setItemType(id);
    // Let CreateMealModal handle its own internal state and UI
    setShowCreateMealModal(true);
  };
  
  const openDrinkModal = () => { setItemType("Drink"); setShowCreateMealModal(true); };
  const openAlacarteModal = () => { setItemType("A La Carte"); setShowCreateMealModal(true); };
  
  //login features
  const [User, setUser] = useState(null);
  const [isManager, setisManager] = useState(false);
  function fetchUserData() {
    // console.log("Fetching user data...");
    return fetch('/api/get-user', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user || null);
          setisManager(data.isManager || false);
          console.log("Fetched user data:", data.user, "Is Manager:", data.isManager);
          return data;
        }
      });
  }

  // Note: buy/clear/remove/purchase actions are implemented in their own components

  // Navigate back to the top-level login page (App shows login UI when pathname === '/')
  const handleSignOut = () => navigate('/');
  const handleReset = () => {
    // simply close the create meal modal; CreateMealModal owns its state
    setShowCreateMealModal(false);
  }

  const handleShowVoid = () => setShowVoidModal(true);
  const handleAddDiscount = () => setShowDiscountModal(true);
  const handleCreateMeal = () => setShowCreateMealModal(true);

  const getTranslatedItemName = (name) => translatedItemNames[name] || name;

  // Handle customize order by opening CreateMealModal in customize mode
  const handleCustomizeOrder = () => {
    if (selectedRow === null) {
      alert('Please select an item to customize');
      return;
    }
    if (debugging) console.log("Customize order clicked for index:", selectedRow);
    
    // Get the item type from the raw order data
    const orderToCustomize = rawOrders[selectedRow];
    if (!orderToCustomize) {
      console.error("Could not find order data for index:", selectedRow);
      return;
    }

    // The item name (e.g., "Bowl", "Plate") is in orderToCustomize.item
    // If it's an object, get the name property
    let type = orderToCustomize.item;
    if (typeof type === 'object' && type !== null) {
      type = type.name || type.menuName;
    }

    // Set customize mode and open the modal
    setCustomizingIndex(selectedRow);
    setItemType(type);
    setShowCreateMealModal(true);
  }
  
  

  //Called on page refresh, should update frontend based on what is on the server
  useEffect(() => {
    
    console.log("Fetching current state from server...");
    // Guard against double runs in development caused by React.StrictMode (React 18 double-mount)
    // and by HMR remounts. Use a window-scoped flag so the fetch only happens once per page load.
    try {
      if (typeof window !== 'undefined') {
        if (window.__cashier_initial_fetch_done) return;
        window.__cashier_initial_fetch_done = true;
      }
    } catch (e) {
      // ignore any access errors and continue
    }

    // Always clear cashier order persistence on page load to start fresh
    clearOrder('cashier');
    console.log("Cleared cashier order persistence on page load");

    UpdatePage();
  }, []);
  

  // Scroll to the latest added item whenever transactionItems change
  useEffect(() => {
    if (lastRowRef.current) {
      lastRowRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transactionItems]);

  // Translate dynamic item names when orders or language change
  useEffect(() => {
    if (!translationContext) return;

    const extractName = (item) => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (typeof item === 'object') return item.name || item.menuName || item.item || '';
      return '';
    };

    const translateNames = async () => {
      const texts = new Set();
      transactionItems.forEach(entry => {
        const name = extractName(entry.item);
        if (name) texts.add(name);
      });

      if (selectedLanguage === 'en') {
        const english = {};
        texts.forEach(text => english[text] = text);
        setTranslatedItemNames(english);
        return;
      }

      if (texts.size === 0) {
        setTranslatedItemNames({});
        return;
      }

      try {
        const arr = Array.from(texts);
        const translations = await translationContext.translateMultiple(arr, selectedLanguage);
        const map = {};
        arr.forEach((t, i) => { map[t] = translations[i] || t; });
        setTranslatedItemNames(map);
      } catch (error) {
        console.error('Failed to translate cashier item names:', error);
        const fallback = {};
        texts.forEach(text => fallback[text] = text);
        setTranslatedItemNames(fallback);
      }
    };

    translateNames();
  }, [transactionItems, selectedLanguage, translationContext]);

  const UpdatePage = () => {
  fetch("/api/current-state", {
    credentials: 'include' // Include cookies with this request
  })
      .then((res) => res.json())
      .then((data) => {
        //Formats orders into a flat array for display
        // console.log("Update Page Current State Data:", data);
        if (Array.isArray(data.orders)) {
          const formattedItems = data.orders.flatMap(order => [
            { cost: order.cost, item: order.item, type: "main"},
            ...(order.entrees ? order.entrees.map(entree => ({ item: (typeof entree === 'string' ? { name: entree } : entree), type: "entree" })) : []),
            ...(order.sides ? order.sides.map(side => ({ item: (typeof side === 'string' ? { name: side } : side), type: "side" })) : [])
          ]);
          // console.log("UpdatePage Formatted:", formattedItems);
          //updates the front end to show current items
          setTransactionItems(formattedItems);
          setRawOrders(data.orders);
          saveOrder(formattedItems, 'cashier');
        } else {
          setTransactionItems([]);
          setRawOrders([]);
          saveOrder([], 'cashier');
        }
        //Calls functions to update their states
        setCurrCost(data.currCost || 0);
        setPriceTotal(data.totalPrice || 0);
        setTax(data.tax || 0);
        setDiscountAmount(data.discountAmount || 0);
        setDiscountPriceOff(data.priceOff || 0);
      });
      fetchUserData();
  }
  function handlePurchase() {
    //reset temp manager on purchase

    // After purchase, refresh the page state
    UpdatePage();
    //logout if was temp manager
    if(tempManager){
      navigate('/login?returnTo=/cashier');
    }
    //move to login page

    setTempManager(false);

  }


  const orderCountLabel = transactionItems.length === 1
    ? `1 ${translatedTexts['item'] || 'item'}`
    : `${transactionItems.length} ${translatedTexts['items'] || 'items'}`;
  return (
    <div className="main-page bkgColor cashier-screen">
      {/* //to use the size modal, set sizes based on options, then collect setSelectedSize for output */}
      {showSizeModal && (
        <SizeModal
          // pass a function so we don't call the setter during render
          onClose={() => {
            setShowSizeModal(false);
            setPendingSizeCallback(null);
          }}
          onSelectSize={(size) => {
            setSelectedSize(size);
            setShowSizeModal(false);
            if (typeof pendingSizeCallback === 'function') {
              try { pendingSizeCallback(size); } catch (e) { console.error(e); }
              setPendingSizeCallback(null);
            }
          }}
          sizes={sizeOptions}
        />
      )}

      <CreateMealModal
        show={showCreateMeal}
        onClose={handleReset}
        initialType={itemType}
        onBought={() => { UpdatePage(); setCustomizingIndex(null); }}
        customizingIndex={customizingIndex}
        initialOrderData={customizingIndex !== null ? rawOrders[customizingIndex] : null}
        // allow the modal to request a size selection; the modal provides a callback to receive the selected size
        requestSizeSelection={(receiveSizeCallback) => {
          if (typeof receiveSizeCallback === 'function') {
            setPendingSizeCallback(() => receiveSizeCallback);
            setShowSizeModal(true);
          }
        }}
        selectedSize={selectedSize}
      />
      <DiscountModal
        show={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        onApplied={({ discountAmount: amt, priceOff: off, discountPer }) => {
          // update local discount view and refresh state from server
          setShowDiscountModal(false);
          setDiscountAmount(amt || 0);
          setDiscountPriceOff(off || 0);
          UpdatePage();
        }}
        userIsManager={isManager || tempManager}
      />
      {showSignOutModal && (
        <SignOutButton onClose={() => setShowSignOutModal(false)} />
      )}
      <VoidModal
        show={showVoidModal}
        onClose={() => setShowVoidModal(false)}
        userIsManager={isManager}
      />
      <header className="cashier-top">
        <div className="top-meta">
          <span className="meta-value">{User?.username || translatedTexts['Employee'] || "Employee"}</span>
        </div>
        <div className="top-meta">
          <span className="meta-value">{currentTime}</span>
        </div>
        <div className="top-meta language-picker">
          <span className="meta-label">{translatedTexts['Language'] || 'Language'}</span>
          <select
            className="language-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage && setSelectedLanguage(e.target.value)}
          >
            {Object.entries(supportedLanguages).map(([code, label]) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        </div>
      </header>

      <main className="cashier-grid">
        <section className="card actions-column">
          <div className="action-stack">
            {[
              { text: translatedTexts['Discount'] || "Discount", handler: handleAddDiscount },
              { text: translatedTexts['Void'] || "Void", handler: handleShowVoid },
              { text: translatedTexts['Sign Out'] || "Sign Out", handler: () => setShowSignOutModal(true) },
            ].map((btn) => (
              <button key={btn.text} onClick={btn.handler} className="function-button">
                {btn.text}
              </button>
            ))}
          </div>
        </section>

        <section className="card menu-column">
          <div className="cashier-menu-groups">
            <div className="cashier-menu-row">
              {["Bowl", "Plate", "Bigger", "Family"].map((item) => (
                <button key={item} id={item} className="cashier-menu-button" onClick={handleBuildItem}>
                  {translatedTexts[item] || item}
                </button>
              ))}
            </div>
            <div className="cashier-menu-row">
              {["A La Carte", "Appetizer", "Drink", "Bottle"].map((item) => (
                <button key={item} id={item} className="cashier-menu-button" onClick={handleBuildItem}>
                  {translatedTexts[item] || item}
                </button>
              ))}
            </div>
          </div>
          <div className="update-row">
            <div className="update-btn">
              <RemoveItemButton index={selectedRow} onRemoved={() => { setSelectedRow(null); UpdatePage(); }} />
            </div>
            <div className="update-btn">
              <ClearTransactionButton onCleared={() => { setSelectedRow(null); UpdatePage(); }} />
            </div>
            <button onClick={handleCustomizeOrder} className="UpdateOrderButton" disabled={selectedRow === null || selectedRow === undefined}>
              {translatedTexts['CUSTOMIZE'] || 'CUSTOMIZE'}
            </button>
          </div>
        </section>

        <section className="card order-column">
          <div className="column-heading">
            <h2>{translatedTexts['Current Order'] || 'Current Order'}</h2>
            <span className="order-count">{orderCountLabel}</span>
          </div>
          <div className="order-table-wrapper">
            <CashierCostTable
              transactionItems={transactionItems}
              selectedRow={selectedRow}
              setSelectedRow={setSelectedRow}
              lastRowRef={lastRowRef}
              translatedTexts={translatedTexts}
              getTranslatedItemName={getTranslatedItemName}
            />
          </div>
          <div className="order-bottom">
            <div className="order-descriptors">
              {[
                { label: translatedTexts['Subtotal'] || "Subtotal", value: currCost },
                { label: translatedTexts['DiscountLabel'] || "Discount", value: -(discountAmount || 0) - (discountPriceOff || 0) },
                { label: translatedTexts['Tax'] || "Tax", value: tax },
                { label: translatedTexts['Total'] || "Total", value: priceTotal }
              ].map((row) => (
                <div key={row.label} className="descriptor-row">
                  <span className="descriptor-label">{row.label}</span>
                  <span className="descriptor-value">
                    {row.label === "Discount" ? "-" : ""}${Math.abs(row.value || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="order-footer">
              <PurchaseButton onPurchased={handlePurchase} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}