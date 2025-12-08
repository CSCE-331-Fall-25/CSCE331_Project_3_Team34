import React, { useEffect, useState, useContext } from "react";
import "../styles/Cashier/DiscountModal.css";
import { TranslationContext } from "../contexts/TranslationContext";

export default function CreateMealModal({ show, onClose, initialType, onBought, requestSizeSelection, selectedSize, customizingIndex, initialOrderData }) {
  const [extraMenus, setExtraMenus] = useState([]);
  const isCustomizeMode = customizingIndex !== null && customizingIndex !== undefined;

  // --- Translation --- //
  const translationContext = useContext(TranslationContext);
  const selectedLanguage = translationContext?.selectedLanguage || 'en';
  const [translatedItemNames, setTranslatedItemNames] = useState({});
  const [translatedTexts, setTranslatedTexts] = useState({

    'Entrees': 'Entrees',
    'Sides': 'Sides',
    'Drinks': 'Drinks',
    'Bottles': 'Bottles',
    'A La Carte': 'A La Carte',
    'Appetizers': 'Appetizers',
    'Selected Entrees': 'Selected Entrees',
    'Selected Sides': 'Selected Sides',
    'Selected Drink': 'Selected Drink',
    'Selected Bottle': 'Selected Bottle',
    'Selected Item': 'Selected Item',
    'Selected Appetizer': 'Selected Appetizer',
    'Set Size': 'Set Size',
    'Continue': 'Continue',
    'Update Order': 'Update Order',
    'NONE': 'NONE'
  });

  const [showMealGUI, setShowMealGUI] = useState(false);
  const [showAppGUI, setShowAppGUI] = useState(false);
  const [showDrinkGUI, setShowDrinkGUI] = useState(false);
  const [showBottleGUI, setShowBottleGUI] = useState(false);
  const [showAlcGUI, setShowAlcGUI] = useState(false);

  const [numEntree, setNumEntree] = useState(0);
  const [numSide, setNumSide] = useState(0);
  const [numApp, setNumApp] = useState(0);
  const [numDrink, setNumDrink] = useState(0);
  const [numALC, setNumALC] = useState(0);

  const [entreeList, setEntreeList] = useState([]);
  const [sideList, setSideList] = useState([]);
  const [appList, setAppList] = useState([]);
  const [drinkList, setDrinkList] = useState([]);
  const [alcList, setAlcList] = useState([]);
  const [drinkSizes, setDrinkSizes] = useState([]);
  const [alcSizes, setAlcSizes] = useState([]);

  const [indexEntree, setIndexEntree] = useState(0);
  const [indexSide, setIndexSide] = useState(0);
  const [indexApp, setIndexApp] = useState(0);
  const [indexDrink, setIndexDrink] = useState(0);
  const [indexALC, setIndexALC] = useState(0);

  const [alcMode, setAlcMode] = useState(false);

  const itemRowSize = 8;

  // fetch menus by type (copied from original file)
  const fetchMenusByType = async (type) => {
    try {
      const response = await fetch("/api/fetch-menus-by-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await response.json();
      if (response.ok) return data;
      console.error("Error fetching menus:", data.error);
      return [];
    } catch (error) {
      console.error("Error fetching menus:", error);
      return [];
    }
  };

  // Fetch menus once when modal opens
  useEffect(() => {
    if (!show) return;
    let mounted = true;
    (async () => {
      const fetchedEntrees = await fetchMenusByType("entree");
      const fetchedSides = await fetchMenusByType("side");
      const fetchedApps = await fetchMenusByType("appetizer");
      const fetchedDrinks = await fetchMenusByType("drink");
      const fetchedBottles = await fetchMenusByType("bottle");
      if (!mounted) return;
      setExtraMenus([...(fetchedEntrees || []), ...(fetchedSides || []), ...(fetchedApps || []), ...(fetchedDrinks || []), ...(fetchedBottles || [])]);
    })();
    return () => { mounted = false; };
  }, [show]);

  // Translate menu item names when extraMenus or language changes
  useEffect(() => {
    if (!translationContext) return;

    const translateMenuNames = async () => {
      const texts = new Set();
      extraMenus.forEach(item => {
        if (item.menuName) texts.add(item.menuName);
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
        console.error('Failed to translate meal menu names:', error);
        const fallback = {};
        texts.forEach(text => fallback[text] = text);
        setTranslatedItemNames(fallback);
      }
    };

    translateMenuNames();
  }, [extraMenus, selectedLanguage]);

  // Translate static UI texts
  useEffect(() => {
    if (!translationContext) return;

    const translateUITexts = async () => {
      const uiTexts = ['Entrees', 'Sides', 'Drinks', 'Bottles', 'A La Carte', 'Appetizers', 'Selected Entrees', 'Selected Sides', 'Selected Drink', 'Selected Bottle', 'Selected Item', 'Selected Appetizer', 'Set Size', 'Continue', 'Update Order', 'NONE'];

      if (selectedLanguage === 'en') {
        const english = {};
        uiTexts.forEach(text => english[text] = text);
        setTranslatedTexts(english);
        return;
      }

      try {
        const translations = await translationContext.translateMultiple(uiTexts, selectedLanguage);
        const map = {};
        uiTexts.forEach((t, i) => { map[t] = translations[i] || t; });
        setTranslatedTexts(map);
      } catch (error) {
        console.error('Failed to translate UI texts:', error);
        const fallback = {};
        uiTexts.forEach(text => fallback[text] = text);
        setTranslatedTexts(fallback);
      }
    };

    translateUITexts();
  }, [selectedLanguage]);

  // prepare categorized arrays
  const items_entrees = [];
  const items_sides = [];
  const items_apps = [];
  const items_drinks = [];
  const items_bottles = [];

  for (let i = 0; i < extraMenus.length; i++) {
    const it = extraMenus[i];
    const t = (it.type || "").toLowerCase();
    if (t === "entree") items_entrees.push(it);
    else if (t === "side") items_sides.push(it);
    else if (t === "appetizer" || t === "app") items_apps.push(it);
    else if (t === "drink") items_drinks.push(it);
    else if (t === "bottle") items_bottles.push(it);
    else items_sides.push(it);
  }

  const items_alc = [...items_entrees, ...items_sides];

  const rows_entree = [];
  for (let i = 0; i < items_entrees.length; i += itemRowSize) rows_entree.push(items_entrees.slice(i, i + itemRowSize));
  const rows_side = [];
  for (let i = 0; i < items_sides.length; i += itemRowSize) rows_side.push(items_sides.slice(i, i + itemRowSize));
  const rows_app = [];
  for (let i = 0; i < items_apps.length; i += itemRowSize) rows_app.push(items_apps.slice(i, i + itemRowSize));
  const rows_drink = [];
  for (let i = 0; i < items_drinks.length; i += itemRowSize) rows_drink.push(items_drinks.slice(i, i + itemRowSize));
  const rows_bottle = [];
  for (let i = 0; i < items_bottles.length; i += itemRowSize) rows_bottle.push(items_bottles.slice(i, i + itemRowSize));
  const rows_alc = [];
  for (let i = 0; i < items_alc.length; i += itemRowSize) rows_alc.push(items_alc.slice(i, i + itemRowSize));

  // initialize modal internal state when opened or when initialType changes
  useEffect(() => {
    if (!show) return;
    const id = initialType;
    // reset lists and indexes
    setEntreeList([]); setSideList([]); setAppList([]); setDrinkList([]); setAlcList([]);
    setIndexEntree(0); setIndexSide(0); setIndexApp(0); setIndexDrink(0); setIndexALC(0);
    setShowMealGUI(false); setShowAppGUI(false); setShowDrinkGUI(false); setShowBottleGUI(false); setShowAlcGUI(false);

    let newNumEntree = 0, newNumSide = 0, newNumApp = 0, newNumDrink = 0, newNumALC = 0;

    switch (id) {
      case "Bowl": newNumEntree = 1; newNumSide = 1; setShowMealGUI(true); break;
      case "Plate": newNumEntree = 2; newNumSide = 1; setShowMealGUI(true); break;
      case "Bigger": newNumEntree = 3; newNumSide = 1; setShowMealGUI(true); break;
      case "Family": newNumEntree = 3; newNumSide = 2; setShowMealGUI(true); break;
      case "A La Carte": newNumALC = 1; setShowAlcGUI(true); setAlcMode(true); break;
      case "Drink": newNumDrink = 1; setShowDrinkGUI(true); setAlcMode(false); break;
      case "Bottle": newNumDrink = 1; setShowBottleGUI(true); setAlcMode(false); break;
      case "Appetizer": newNumApp = 1; setShowAppGUI(true); break;
      default: /* leave defaults */ break;
    }

    setNumEntree(newNumEntree); setNumSide(newNumSide); setNumApp(newNumApp); setNumDrink(newNumDrink); setNumALC(newNumALC);
    
    // Initialize lists with nulls
    let initEntreeList = Array(newNumEntree).fill(null);
    let initSideList = Array(newNumSide).fill(null);
    let initAppList = Array(newNumApp).fill(null);
    let initDrinkList = Array(newNumDrink).fill(null);
    let initAlcList = Array(newNumALC).fill(null);
    
    // If customizing, populate from initialOrderData
    if (isCustomizeMode && initialOrderData) {
      const toObj = (item) => (typeof item === 'string' ? { menuName: item } : { menuName: item.name || item.menuName });
      
      if (initialOrderData.entrees && Array.isArray(initialOrderData.entrees)) {
        initialOrderData.entrees.forEach((item, idx) => {
          if (idx < newNumEntree) initEntreeList[idx] = toObj(item);
        });
        // Set index to the next empty slot, or the length if full
        const filledCount = Math.min(initialOrderData.entrees.length, newNumEntree);
        setIndexEntree(filledCount);
      }
      
      if (initialOrderData.sides && Array.isArray(initialOrderData.sides)) {
        initialOrderData.sides.forEach((item, idx) => {
          if (idx < newNumSide) initSideList[idx] = toObj(item);
        });
        const filledCount = Math.min(initialOrderData.sides.length, newNumSide);
        setIndexSide(filledCount);
      }

      // Handle A La Carte / Drink / Appetizer if needed
      // Note: The current backend structure for ALC/Drink might be different (entrees list vs specific fields)
      // But based on UpdatePage, everything is in entrees/sides or just 'item'
      
      // For ALC, the item itself is the entree
      if (id === "A La Carte" && initialOrderData.entrees && initialOrderData.entrees.length > 0) {
         initialOrderData.entrees.forEach((item, idx) => {
            if (idx < newNumALC) {
              initAlcList[idx] = toObj(item);
              // If the item has a size property, use it
              if (item.size) setAlcSizes(prev => { const u = [...prev]; u[idx] = item.size; return u; });
            }
         });
         setIndexALC(Math.min(initialOrderData.entrees.length, newNumALC));
      }
      
      // For Drink, similar logic
      if (id === "Drink" && initialOrderData.entrees && initialOrderData.entrees.length > 0) {
         initialOrderData.entrees.forEach((item, idx) => {
            if (idx < newNumDrink) initDrinkList[idx] = toObj(item);
         });
         setIndexDrink(Math.min(initialOrderData.entrees.length, newNumDrink));
         // If top-level size exists, use it for the drink
         if (initialOrderData.size) {
            setDrinkSizes(Array(newNumDrink).fill(initialOrderData.size));
         }
      }
    }

    setEntreeList(initEntreeList); 
    setSideList(initSideList); 
    setAppList(initAppList); 
    setDrinkList(initDrinkList); 
    setAlcList(initAlcList);
    
    // default sizes: prefer the selectedSize passed from Cashier, otherwise default to 'Small'
    // Only overwrite if we didn't set them from initialOrderData (which we did above via setAlcSizes/setDrinkSizes calls, but wait...)
    // The setAlcSizes calls above are inside the if block.
    // But here I am overwriting them with defaultSize.
    // I should initialize them correctly first.
    
    const defaultSize = selectedSize || 'Small';
    let initDrinkSizes = Array(newNumDrink).fill(defaultSize);
    let initAlcSizes = Array(newNumALC).fill(defaultSize);
    
    if (isCustomizeMode && initialOrderData) {
        if (id === "Drink" && initialOrderData.size) {
            initDrinkSizes.fill(initialOrderData.size);
        }
        if (id === "A La Carte" && initialOrderData.entrees) {
            initialOrderData.entrees.forEach((item, idx) => {
                if (idx < newNumALC && item.size) {
                    initAlcSizes[idx] = item.size;
                }
            });
        }
    }
    
    setDrinkSizes(initDrinkSizes); 
    setAlcSizes(initAlcSizes);
  }, [show, initialType, initialOrderData, isCustomizeMode]);

  const selectAttribute = (item) => {
    if (alcMode) {
      setIndexALC(prev => {
        if (prev >= numALC) return prev;
        setAlcList(prevList => { const updated = [...prevList]; updated[prev] = item; return updated; });
        return prev + 1;
      });
      return;
    }
    const t = (item.type || "").toLowerCase();
    if (t === "entree") {
      setIndexEntree(prev => {
        if (prev >= numEntree) return prev;
        setEntreeList(prevList => { const updated = [...prevList]; updated[prev] = item; return updated; });
        return prev + 1;
      });
    } else if (t === "side") {
      setIndexSide(prev => {
        if (prev >= numSide) return prev;
        setSideList(prevList => { const updated = [...prevList]; updated[prev] = item; return updated; });
        return prev + 1;
      });
    } else if (t === "appetizer") {
      setIndexApp(prev => {
        if (prev >= numApp) return prev;
        setAppList(prevList => { const updated = [...prevList]; updated[prev] = item; return updated; });
        return prev + 1;
      });
    } else if (t === "drink" || t === "bottle") {
      setIndexDrink(prev => {
        if (prev >= numDrink) return prev;
        setDrinkList(prevList => { const updated = [...prevList]; updated[prev] = item; return updated; });
        // set a default size for this drink slot (use existing value if present)
        setDrinkSizes(prev => { const u = [...prev]; if (!u[prev]) u[prev] = selectedSize || 'Small'; return u; });
        return prev + 1;
      });
    }
  };

  const getTranslatedItemName = (name) => translatedItemNames[name] || name;

  const removeIndex = (i, type) => {
    if (type === "Entree") {
      const updated = [...entreeList]; updated[i] = null; const compact = updated.filter(x => x !== null); while (compact.length < numEntree) compact.push(null); setEntreeList(compact); setIndexEntree(Math.max(indexEntree - 1, 0));
    } else if (type === "Side") {
      const updated = [...sideList]; updated[i] = null; const compact = updated.filter(x => x !== null); while (compact.length < numSide) compact.push(null); setSideList(compact); setIndexSide(Math.max(indexSide - 1, 0));
    } else if (type === "Appetizer") {
      const updated = [...appList]; updated[i] = null; const compact = updated.filter(x => x !== null); while (compact.length < numApp) compact.push(null); setAppList(compact); setIndexApp(Math.max(indexApp - 1, 0));
    } else if (type === "Drink") {
      const updated = [...drinkList]; updated[i] = null; const compact = updated.filter(x => x !== null); while (compact.length < numDrink) compact.push(null); setDrinkList(compact); setIndexDrink(Math.max(indexDrink - 1, 0));
    } else if (type === "A La Carte") {
      const updated = [...alcList]; updated[i] = null; const compact = updated.filter(x => x !== null); while (compact.length < numALC) compact.push(null); setAlcList(compact); setIndexALC(Math.max(indexALC - 1, 0));
    }
  };

  // set size handlers for drink and a la carte entries
  const setDrinkSizeAt = (i, size) => {
    setDrinkSizes(prev => { const u = [...prev]; u[i] = size; return u; });
  };
  const setAlcSizeAt = (i, size) => {
    setAlcSizes(prev => { const u = [...prev]; u[i] = size; return u; });
  };

  const handleFinishSelection = () => {
    let finished = false;
    const mealTypes = ["Bowl", "Plate", "Bigger", "Family"];
    const drinkTypes = ["Drink", "Bottle"];
    if (mealTypes.includes(initialType)) finished = (indexEntree === numEntree) && (indexSide === numSide);
    else if (initialType === "A La Carte") finished = (indexALC === numALC);
    else if (initialType === "Appetizer") finished = (indexApp === numApp);
    else if (drinkTypes.includes(initialType)) finished = (indexDrink === numDrink);
    else finished = (indexEntree === numEntree) && (indexSide === numSide);

    if (!finished) return;
    // Normalizer helper: convert selected menu objects into string names the server expects
    const normalize = (it) => {
      if (!it) return null;
      if (typeof it === 'string') return it;
      // prefer `.name` but accept legacy `menuName` as well
      return it.name || it.menuName || String(it);
    };

    const payloadEntreeList = [];
    (Array.isArray(entreeList) ? entreeList : []).forEach(it => { const n = normalize(it); if (n) payloadEntreeList.push(n); });
  if (initialType === "A La Carte") (Array.isArray(alcList) ? alcList : []).forEach((it, idx) => { const n = normalize(it); if (n) payloadEntreeList.push(alcSizes[idx] ? { name: n, size: alcSizes[idx] } : { name: n }); });
  if (initialType === "Appetizer") (Array.isArray(appList) ? appList : []).forEach(it => { const n = normalize(it); if (n) payloadEntreeList.push(n); });
  if (initialType === "Drink" || initialType === "Bottle") (Array.isArray(drinkList) ? drinkList : []).forEach((it, idx) => { const n = normalize(it); if (n) payloadEntreeList.push(drinkSizes[idx] ? { name: n, size: drinkSizes[idx] } : { name: n }); });

    const payloadSideList = [];
    (Array.isArray(sideList) ? sideList : []).forEach(it => { const n = normalize(it); if (n) payloadSideList.push(n); });

    // If this was a single-item flow (A La Carte / Drink / Bottle) and the first entree includes a size,
    // also provide a top-level `size` field for backwards compatibility with server APIs that expect it.
    let topLevelSize = null;
    try {
      if (["A La Carte", "Drink"].includes(initialType) && Array.isArray(payloadEntreeList) && payloadEntreeList.length === 1) {
        const first = payloadEntreeList[0];
        if (first && typeof first === 'object' && first.size) topLevelSize = first.size;
      }
    } catch (e) { /* ignore */ }

    // Determine the endpoint and payload based on mode
    const endpoint = isCustomizeMode ? "/api/update-item" : "/api/buy-item";
    const payload = isCustomizeMode 
      ? { itemIndex: customizingIndex, itemID: initialType, entreeList: payloadEntreeList, sideList: payloadSideList, size: topLevelSize }
      : { itemID: initialType, entreeList: payloadEntreeList, sideList: payloadSideList, size: topLevelSize };

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (typeof onBought === 'function') onBought();
        } else {
          console.error("Failed to buy/update item:", initialType);
        }
        onClose();
      }).catch(e => {
        console.error(e); onClose();
      });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay-meal" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => onClose()}>
      <div className="p-4 space-y-3 modal-menu-container" style={{ background: "#f9f9fb", padding: "2.5rem 2rem 2rem 2rem", borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", minWidth: "90vw", maxWidth: "90vw", position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }} onClick={e => e.stopPropagation()}>
        {showMealGUI && (
          <>
            <div className="main-layout">
              <div className="menu-wrapper">
                <div className="section section-entrees">
                  <h3 className="section-title">{translatedTexts['Entrees']}</h3>
                  {rows_entree.map((row, rowIndex) => (
                    <div key={rowIndex} className={`menu-row `}>
                      {row.map((item, itemIndex) => (
                        <button key={itemIndex} id={item.menuName} className="buy-button" onClick={() => selectAttribute(item)}>{getTranslatedItemName(item.menuName)}</button>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="section section-sides">
                  <h3 className="section-title">{translatedTexts['Sides']}</h3>
                  {rows_side.map((row, rowIndex) => (
                    <div key={rowIndex} className={`menu-row ${rowIndex > 0 ? 'spaced' : ''}`}>
                      {row.map((item, itemIndex) => (
                        <button key={itemIndex} id={item.menuName} className="buy-button" onClick={() => selectAttribute(item)}>{getTranslatedItemName(item.menuName)}</button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="selected-panel">
              <div className="selected-group">
                <h3 className="section-title">{translatedTexts['Selected Entrees']}</h3>
                {Array.from({ length: numEntree }).map((_, i) => (
                  <button key={i} className="selected-button" onClick={() => removeIndex(i, "Entree")}>{entreeList[i] ? getTranslatedItemName(entreeList[i].menuName) : translatedTexts['NONE']}</button>
                ))}
              </div>
              <div className="selected-group">
                <h3 className="section-title">{translatedTexts['Selected Sides']}</h3>
                {Array.from({ length: numSide }).map((_, i) => (
                  <button key={i} className="selected-button" onClick={() => removeIndex(i, "Side")}>{sideList[i] ? getTranslatedItemName(sideList[i].menuName) : translatedTexts['NONE']}</button>
                ))}
              </div>
            </div>
          </>
        )}

        {showDrinkGUI && (
          <>
            <div className="main-layout">
              <div className="menu-wrapper">
                <div className="section section-drinks">
                  <h3 className="section-title">{translatedTexts['Drinks']}</h3>
                  {rows_drink.map((row, rowIndex) => (
                    <div key={rowIndex} className={`menu-row `}>
                      {row.map((item, itemIndex) => (
                        <button key={itemIndex} id={item.menuName} className="buy-button" onClick={() => selectAttribute(item)}>{getTranslatedItemName(item.menuName)}</button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="selected-panel">
              <div className="selected-group">
                <h3 className="section-title">{translatedTexts['Selected Drink']}</h3>
                {Array.from({ length: numDrink }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button className="selected-button" onClick={() => removeIndex(i, "Drink")}>{drinkList[i] ? `${getTranslatedItemName(drinkList[i].menuName)}${drinkSizes[i] ? ` (${drinkSizes[i]})` : ''}` : translatedTexts['NONE']}</button>
                    <button className="small-button" onClick={() => {
                      if (typeof requestSizeSelection === 'function') {
                        requestSizeSelection((size) => setDrinkSizeAt(i, size));
                      }
                    }}>{translatedTexts['Set Size']}</button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {showBottleGUI && (
          <>
            <div className="main-layout">
              <div className="menu-wrapper">
                <div className="section section-drinks">
                  <h3 className="section-title">{translatedTexts['Bottles']}</h3>
                  {rows_bottle.map((row, rowIndex) => (
                    <div key={rowIndex} className={`menu-row `}>
                      {row.map((item, itemIndex) => (
                        <button key={itemIndex} id={item.menuName} className="buy-button" onClick={() => selectAttribute(item)}>{getTranslatedItemName(item.menuName)}</button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="selected-panel">
              <div className="selected-group">
                <h3 className="section-title">{translatedTexts['Selected Bottle']}</h3>
                {Array.from({ length: numDrink }).map((_, i) => (
                  <button key={i} className="selected-button" onClick={() => removeIndex(i, "Drink")}>{drinkList[i] ? getTranslatedItemName(drinkList[i].menuName) : translatedTexts['NONE']}</button>
                ))}
              </div>
            </div>
          </>
        )}

        {showAlcGUI && (
          <>
            <div className="main-layout">
              <div className="menu-wrapper">
                <div className="section section-entrees">
                  <h3 className="section-title">{translatedTexts['A La Carte']}</h3>
                  {rows_alc.map((row, rowIndex) => (
                    <div key={rowIndex} className={`menu-row `}>
                      {row.map((item, itemIndex) => (
                        <button key={itemIndex} id={item.menuName} className="buy-button" onClick={() => selectAttribute(item)}>{getTranslatedItemName(item.menuName)}</button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="selected-panel">
              <div className="selected-group">
                <h3 className="section-title">{translatedTexts['Selected Item']}</h3>
                {Array.from({ length: numALC }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button className="selected-button" onClick={() => removeIndex(i, "A La Carte")}>{alcList[i] ? `${getTranslatedItemName(alcList[i].menuName)}${alcSizes[i] ? ` (${alcSizes[i]})` : ''}` : translatedTexts['NONE']}</button>
                    <button className="small-button" onClick={() => {
                      if (typeof requestSizeSelection === 'function') {
                        requestSizeSelection((size) => setAlcSizeAt(i, size));
                      }
                    }}>{translatedTexts['Set Size']}</button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {showAppGUI && (
          <>
            <div className="main-layout">
              <div className="menu-wrapper">
                <div className="section section-entrees">
                  <h3 className="section-title">{translatedTexts['Appetizers']}</h3>
                  {rows_app.map((row, rowIndex) => (
                    <div key={rowIndex} className={`menu-row `}>
                      {row.map((item, itemIndex) => (
                        <button key={itemIndex} id={item.menuName} className="buy-button" onClick={() => selectAttribute(item)}>{getTranslatedItemName(item.menuName)}</button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="selected-panel">
              <div className="selected-group">
                <h3 className="section-title">{translatedTexts['Selected Appetizer']}</h3>
                {Array.from({ length: numApp }).map((_, i) => (
                  <button key={i} className="selected-button" onClick={() => removeIndex(i, "Appetizer")}>{appList[i] ? getTranslatedItemName(appList[i].menuName) : translatedTexts['NONE']}</button>
                ))}
              </div>
            </div>
          </>
        )}

        <button className="continue-button" onClick={handleFinishSelection}>{isCustomizeMode ? translatedTexts['Update Order'] : translatedTexts['Continue']}</button>
      </div>
    </div>
  );
}
