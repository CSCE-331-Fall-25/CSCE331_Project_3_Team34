import React, { useEffect, useState } from "react";
import "../styles/Cashier/DiscountModal.css";

export default function CreateMealModal({ show, onClose, initialType, onBought }) {
  const [extraMenus, setExtraMenus] = useState([]);

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
    setEntreeList(Array(newNumEntree).fill(null)); setSideList(Array(newNumSide).fill(null)); setAppList(Array(newNumApp).fill(null)); setDrinkList(Array(newNumDrink).fill(null)); setAlcList(Array(newNumALC).fill(null));
  }, [show, initialType]);

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
        return prev + 1;
      });
    }
  };

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
    if (initialType === "A La Carte") (Array.isArray(alcList) ? alcList : []).forEach(it => { const n = normalize(it); if (n) payloadEntreeList.push(n); });
    if (initialType === "Appetizer") (Array.isArray(appList) ? appList : []).forEach(it => { const n = normalize(it); if (n) payloadEntreeList.push(n); });
    if (initialType === "Drink" || initialType === "Bottle") (Array.isArray(drinkList) ? drinkList : []).forEach(it => { const n = normalize(it); if (n) payloadEntreeList.push(n); });

    const payloadSideList = [];
    (Array.isArray(sideList) ? sideList : []).forEach(it => { const n = normalize(it); if (n) payloadSideList.push(n); });

    fetch("/api/buy-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemID: initialType, entreeList: payloadEntreeList, sideList: payloadSideList })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (typeof onBought === 'function') onBought();
        } else {
          console.error("Failed to buy item:", initialType);
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
                  <h3 className="section-title">Entrees:</h3>
                  {rows_entree.map((row, rowIndex) => (
                    <div key={rowIndex} className={`menu-row `}>
                      {row.map((item, itemIndex) => (
                        <button key={itemIndex} id={item.menuName} className="buy-button" onClick={() => selectAttribute(item)}>{item.menuName}</button>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="section section-sides">
                  <h3 className="section-title">Sides:</h3>
                  {rows_side.map((row, rowIndex) => (
                    <div key={rowIndex} className={`menu-row ${rowIndex > 0 ? 'spaced' : ''}`}>
                      {row.map((item, itemIndex) => (
                        <button key={itemIndex} id={item.menuName} className="buy-button" onClick={() => selectAttribute(item)}>{item.menuName}</button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="selected-panel">
              <div className="selected-group">
                <h3 className="section-title">Selected Entrees</h3>
                {Array.from({ length: numEntree }).map((_, i) => (
                  <button key={i} className="selected-button" onClick={() => removeIndex(i, "Entree")}>{entreeList[i] ? entreeList[i].menuName : "NONE"}</button>
                ))}
              </div>
              <div className="selected-group">
                <h3 className="section-title">Selected Sides</h3>
                {Array.from({ length: numSide }).map((_, i) => (
                  <button key={i} className="selected-button" onClick={() => removeIndex(i, "Side")}>{sideList[i] ? sideList[i].menuName : "NONE"}</button>
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
                  <h3 className="section-title">Drinks:</h3>
                  {rows_drink.map((row, rowIndex) => (
                    <div key={rowIndex} className={`menu-row `}>
                      {row.map((item, itemIndex) => (
                        <button key={itemIndex} id={item.menuName} className="buy-button" onClick={() => selectAttribute(item)}>{item.menuName}</button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="selected-panel">
              <div className="selected-group">
                <h3 className="section-title">Selected Drink</h3>
                {Array.from({ length: numDrink }).map((_, i) => (
                  <button key={i} className="selected-button" onClick={() => removeIndex(i, "Drink")}>{drinkList[i] ? drinkList[i].menuName : "NONE"}</button>
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
                  <h3 className="section-title">Bottles:</h3>
                  {rows_bottle.map((row, rowIndex) => (
                    <div key={rowIndex} className={`menu-row `}>
                      {row.map((item, itemIndex) => (
                        <button key={itemIndex} id={item.menuName} className="buy-button" onClick={() => selectAttribute(item)}>{item.menuName}</button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="selected-panel">
              <div className="selected-group">
                <h3 className="section-title">Selected Bottle</h3>
                {Array.from({ length: numDrink }).map((_, i) => (
                  <button key={i} className="selected-button" onClick={() => removeIndex(i, "Drink")}>{drinkList[i] ? drinkList[i].menuName : "NONE"}</button>
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
                  <h3 className="section-title">A La Carte</h3>
                  {rows_alc.map((row, rowIndex) => (
                    <div key={rowIndex} className={`menu-row `}>
                      {row.map((item, itemIndex) => (
                        <button key={itemIndex} id={item.menuName} className="buy-button" onClick={() => selectAttribute(item)}>{item.menuName}</button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="selected-panel">
              <div className="selected-group">
                <h3 className="section-title">Selected Item</h3>
                {Array.from({ length: numALC }).map((_, i) => (
                  <button key={i} className="selected-button" onClick={() => removeIndex(i, "A La Carte")}>{alcList[i] ? alcList[i].menuName : "NONE"}</button>
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
                  <h3 className="section-title">Appetizers:</h3>
                  {rows_app.map((row, rowIndex) => (
                    <div key={rowIndex} className={`menu-row `}>
                      {row.map((item, itemIndex) => (
                        <button key={itemIndex} id={item.menuName} className="buy-button" onClick={() => selectAttribute(item)}>{item.menuName}</button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="selected-panel">
              <div className="selected-group">
                <h3 className="section-title">Selected Appetizer</h3>
                {Array.from({ length: numApp }).map((_, i) => (
                  <button key={i} className="selected-button" onClick={() => removeIndex(i, "Appetizer")}>{appList[i] ? appList[i].menuName : "NONE"}</button>
                ))}
              </div>
            </div>
          </>
        )}

        <button className="continue-button" onClick={handleFinishSelection}>Continue</button>
      </div>
    </div>
  );
}
