import React from "react";
import "../styles/Cashier/Cashier.css";
import "../styles/Cashier/DiscountModal.css";
import { useEffect, useState, useRef } from "react";
// don't import server code into the client bundle
// replace server-side debugging checks with a local flag
const debugging = false;
import { useNavigate } from 'react-router-dom';
export default function Cashier() {
  const navigate = useNavigate();
  //newest Row reference for auto scrolling
  const lastRowRef = useRef(null);
  //handles selected row of items (used for removal/customization)
  const [selectedRow, setSelectedRow] = useState(null);
  //Discount buttons
  const [showCreateMeal, setShowCreateMealModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPriceOff, setDiscountPriceOff] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // Shows items depending on what button is pressed - meal, appetizer, alc, drink
  const [showMealGUI, setShowMealGUI] = useState(false);
  const [showAppGUI, setShowAppGUI] = useState(false);
  const [showDrinkGUI, setShowDrinkGUI] = useState(false);
  const [showBottleGUI, setShowBottleGUI] = useState(false);
  const [showAlcGUI, setShowAlcGUI] = useState(false);

  //updates for orderTable
  const [currCost, setCurrCost] = useState(0);
  const TAXRATE = 0.0825;
  const [transactionItems, setTransactionItems] = useState([]);

  const [numEntree, setNumEntree] = useState(0);
  const [numSide, setNumSide] = useState(0);
  const [itemType, setItemType] = useState("NULL");
  const [numApp, setNumApp] = useState(0);
  const [numDrink, setNumDrink] = useState(0);
  const [numALC, setNumALC] = useState(0);
  
  const [entreeList, setEntreeList] = useState(() => Array(numEntree).fill(null));
  const [sideList, setSideList] = useState(() => Array(numSide).fill(null));
  const [appList, setAppList] = useState(() => Array(numApp).fill(null));
  const [drinkList, setDrinkList] = useState(() => Array(numDrink).fill(null));
  const [indexEntree, setIndexEntree] = useState(0);
  const [indexSide, setIndexSide] = useState(0);
   
  const [indexApp, setIndexApp] = useState(0);
  const [indexDrink, setIndexDrink] = useState(0);
  const [sizeMod, setSizeMod] = useState(0);
  const [indexALC, setIndexALC] = useState(0);
  const [alcList, setAlcList] = useState(() => Array(numALC).fill(null));
  const [alcMode, setAlcMode] = useState(false);
  const [extraMenus, setExtraMenus] = useState([]);

  const items = []; 
  const items_entrees = [];
  const items_sides = [];
  const items_apps = [];
  const items_drinks = [];
  const items_bottles = [];
  const items_alc_small = [];
  const items_alc_medium = [];
  const items_alc_large = [];
  const itemRowSize = 8;

  // TODO: Use for loop to populate this list from the DB
  // (removed erroneous `items.push` calls — `items` was not defined and caused runtime errors)

  // Use fetch menus by type and populate items list
  const fetchMenusByType = async (type) => {
    try {
      const response = await fetch("/api/fetch-menus-by-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        console.error("Error fetching menus:", data.error);
        return [];
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
      return [];
    }
  };

  // Fetch extra menus once on mount and merge with baseItems
  useEffect(() => {
    let mounted = true;
    (async () => {
      const fetchedEntrees = await fetchMenusByType("entree");
      const fetchedSides = await fetchMenusByType("side");
      const fetchedApps = await fetchMenusByType("appetizer");
      const fetchedDrinks = await fetchMenusByType("drink");
      const fetchedBottles = await fetchMenusByType("bottle");
      if (!mounted) return;
      // fetched lists may be arrays of plain objects with name/type
      setExtraMenus([...(fetchedEntrees || []), ...(fetchedSides || []), ...(fetchedApps || []), ...(fetchedDrinks || []), ...(fetchedBottles || [])]);
    })();
    return () => { mounted = false; };
  }, []);

  const combinedItems = [...extraMenus];
  for (let i = 0; i < combinedItems.length; i++) {
    const t = (combinedItems[i].type || '').toLowerCase();
    if (t === 'entree') {
      items_entrees.push(combinedItems[i]);
    } else if (t === 'side') {
      items_sides.push(combinedItems[i]);
    } else if (t === 'appetizer' || t === 'app') {
      items_apps.push(combinedItems[i]);
    } else if (t === 'drink') {
      items_drinks.push(combinedItems[i]);
    } else if (t === 'bottle') {
      items_bottles.push(combinedItems[i]);
    } else {
      // unknown type: push to sides as a fallback
      items_sides.push(combinedItems[i]);
    }
  }

  // A La Carte items should include all entrees and sides
  const items_alc = [...items_entrees, ...items_sides];

  // TODO: Replace these with actual React state or backend calls
  const handleFinishSelection = () => {
    // compute finished dynamically from current state values depending on itemType
    let finished = false;
    const mealTypes = ["Bowl", "Plate", "Bigger", "Family"];
  const drinkTypes = ["Drink", "Bottle"];
    if (mealTypes.includes(itemType)) {
      finished = (indexEntree === numEntree) && (indexSide === numSide);
    } else if (itemType === "A La Carte") {
      finished = (indexALC === numALC);
    } else if (itemType === "Appetizer") {
      finished = (indexApp === numApp);
    } else if (drinkTypes.includes(itemType)) {
      finished = (indexDrink === numDrink);
    } else {
      // default: require entree+side
      finished = (indexEntree === numEntree) && (indexSide === numSide);
    }
    console.log("Finish check:", { itemType, indexEntree, numEntree, indexSide, numSide, indexApp, numApp, indexDrink, numDrink, indexALC, numALC, finished });
    if (finished) {


      // TODO: CREATE THE TRAY TO ADD TRANSACTION LIST!!! ALL YOUR INFORMATION IS PRINTED BELOW!
      // Build the payload entree list. For non-meal single-item types (A La Carte, Appetizer, Drink, Bottle)
      // we want to send a tray via the `entreeList` so the backend will create a Tray for it.
      const payloadEntreeList = Array.isArray(entreeList) ? [...entreeList] : [];

      // If in A La Carte mode, the selected ALC items should be sent as entrees (trays)
      if (itemType === "A La Carte") {
        alcList.forEach(it => { if (it) payloadEntreeList.push(it); });
      }

      // If Appetizer should be treated as a tray, push appList into entree list
      if (itemType === "Appetizer") {
        appList.forEach(it => { if (it) payloadEntreeList.push(it); });
      }

      // Drinks and Bottles should also be sent as a tray in the entreeList
      if (itemType === "Drink" || itemType === "Bottle") {
        drinkList.forEach(it => { if (it) payloadEntreeList.push(it); });
      }

      fetch("/api/buy-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemID: itemType,
          entreeList: payloadEntreeList,
          sideList: sideList
        }),
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("Item bought:", itemType);
          UpdatePage();
        }
        else {
          console.log("ERROR: Failed to buy item:", itemType);
        }
        //console.log("Cost is: ", data.cost)
      });
      // console.log("Meal Created with the following items:");
      // entreeList.forEach((e) => console.log(e ? e.name : "empty"));
      // sideList.forEach((e) => console.log(e ? e.name : "empty"));

      // close UI immediately after sending request
      handleReset();
    }
    else {
      console.log("Finish Adding Items! not finished yet");
    }
  };

  const selectAttribute = (item) => {
    // If we're in A La Carte mode, treat every click as adding to alcList
    if (alcMode) {
      setIndexALC(prevIndex => {
        if (prevIndex >= numALC) return prevIndex;
        setAlcList(prevList => {
          const updated = [...prevList];
          updated[prevIndex] = item;
          return updated;
        });
        console.log("ALC Item Added: " + item.name);
        return prevIndex + 1;
      });
      return;
    }
    const t = (item.type || '').toLowerCase();
    console.log(item.type);
    if (t === "entree") {
      // use functional updates to avoid stale closures
      setIndexEntree(prevIndex => {
        if (prevIndex >= numEntree) return prevIndex;
        setEntreeList(prevList => {
          const updated = [...prevList];
          updated[prevIndex] = item;
          return updated;
        });
        console.log("Item Added: " + item.name);
        return prevIndex + 1;
      });
    } else if (t === "side") {
      setIndexSide(prevIndex => {
        if (prevIndex >= numSide) return prevIndex;
        setSideList(prevList => {
          const updated = [...prevList];
          updated[prevIndex] = item;
          return updated;
        });
        console.log("Item Added: " + item.name);
        return prevIndex + 1;
      });
    } else if (t === "appetizer") {
      setIndexApp(prevIndex => {
        if (prevIndex >= numApp) return prevIndex;
        setAppList(prevList => {
          const updated = [...prevList];
          updated[prevIndex] = item;
          return updated;
        });
        console.log("Item Added: " + item.name);
        return prevIndex + 1;
      });
    } else if (t === "drink" || t === "bottle") {
      setIndexDrink(prevIndex => {
        if (prevIndex >= numDrink) return prevIndex;
        setDrinkList(prevList => {
          const updated = [...prevList];
          updated[prevIndex] = item;
          return updated;
        });
        console.log("Item Added: " + item.name);
        return prevIndex + 1;
      });
    }
  }

  const removeIndex = (i, type) => {
    if (type === "Entree") {
      const updated = [...entreeList];
      updated[i] = null; 
      const compact = updated.filter(x => x !== null);

      while (compact.length < numEntree) {
        compact.push(null);
      }

      setEntreeList(compact);
      setIndexEntree(Math.max(indexEntree - 1, 0));
    } 
    else if (type === "Side") {
      const updated = [...sideList];      
      updated[i] = null; // remove the selected item
      const compact = updated.filter(x => x !== null);

      while (compact.length < numSide) {
        compact.push(null);
      }

      setSideList(compact);
      setIndexSide(Math.max(indexSide - 1, 0));
    } 
    else if (type === "Appetizer") {
      const updated = [...appList];      
      updated[i] = null; // remove the selected item
      const compact = updated.filter(x => x !== null);

      while (compact.length < numApp) {
        compact.push(null);
      }

      setAppList(compact);
      setIndexApp(Math.max(indexApp - 1, 0));
    } 
    else if (type === "Drink") {
      const updated = [...drinkList];      
      updated[i] = null; // remove the selected item
      const compact = updated.filter(x => x !== null);

      while (compact.length < numDrink) {
        compact.push(null);
      }

      setDrinkList(compact);
      setIndexDrink(Math.max(indexDrink - 1, 0));
    }
    else if (type === "A La Carte") {
      const updated = [...alcList];
      updated[i] = null;
      const compact = updated.filter(x => x !== null);
      while (compact.length < numALC) {
        compact.push(null);
      }
      setAlcList(compact);
      setIndexALC(Math.max(indexALC - 1, 0));
    }
  };

  const rows_entree = [];
  for (let i = 0; i < items_entrees.length; i += itemRowSize) {
    rows_entree.push(items_entrees.slice(i, i + itemRowSize));
  }

  const rows_side = [];
  for (let i = 0; i < items_sides.length; i += itemRowSize) {
    rows_side.push(items_sides.slice(i, i + itemRowSize));
  }

  const rows_app = [];
  for (let i = 0; i < items_apps.length; i += itemRowSize) {
    rows_app.push(items_apps.slice(i, i + itemRowSize));
  }

  const rows_drink = [];
  for (let i = 0; i < items_drinks.length; i += itemRowSize) {
    rows_drink.push(items_drinks.slice(i, i + itemRowSize));
  }

  const rows_bottle = [];
  for (let i = 0; i < items_bottles.length; i += itemRowSize) {
    rows_bottle.push(items_bottles.slice(i, i + itemRowSize));
  }

  // rows for A La Carte (items_alc may be populated later)
  const rows_alc = [];
  for (let i = 0; i < items_alc.length; i += itemRowSize) {
    rows_alc.push(items_alc.slice(i, i + itemRowSize));
  }

  const handleSetSizeMod = (e) => {
  
  }

  const handleBuildItem = (e) => {
    const id = e.target.id;
    setItemType(id);

    // compute new counts locally to avoid async state update races
    let newNumEntree = numEntree;
    let newNumSide = numSide;
    let newNumApp = numApp;
    let newNumDrink = numDrink;
    let newNumALC = numALC;

    switch(id) {
      case "Bowl":
        newNumEntree = 1;
        newNumSide = 1;
        setSizeMod(0);
        setShowMealGUI(true);
        break;
      case "Plate":
        newNumEntree = 2;
        newNumSide = 1;
        setSizeMod(0);
        setShowMealGUI(true);
        break;
      case "Bigger":
        newNumEntree = 3;
        newNumSide = 1;
        setSizeMod(0);
        setShowMealGUI(true);
        break;
      case "Family":
        newNumEntree = 3;
        newNumSide = 2;
        setSizeMod(0);
        setShowMealGUI(true);
        break;
      case "A La Carte":
        newNumALC = 1;
        handleSetSizeMod(id);
        // show the A La Carte menu and the selected panel
        setShowAppGUI(false);
        setShowAlcGUI(true);
        setAlcMode(true);
        break; 
      case "Drink":
        newNumDrink = 1;
        handleSetSizeMod(id);
        // hide other menus and show drink selection
        setShowMealGUI(false);
        setShowAppGUI(false);
        setShowAlcGUI(false);
        setAlcMode(false);
        setShowDrinkGUI(true);
        break;
      case "Bottle":
        newNumDrink = 1;
        handleSetSizeMod(id);
        setShowMealGUI(false);
        setShowAppGUI(false);
        setShowAlcGUI(false);
        setAlcMode(false);
        setShowBottleGUI(true);
        break;
      case "Appetizer":
        newNumApp = 1;
        handleSetSizeMod(id);
        setShowAppGUI(true);
        break;
      default:
        console.log("Not a valid type");
        break;
    }

    // apply computed counts to state and initialize lists correctly
    setNumEntree(newNumEntree);
    setNumSide(newNumSide);
    setNumApp(newNumApp);
    setNumDrink(newNumDrink);
    setNumALC(newNumALC);

    setEntreeList(Array(newNumEntree).fill(null));
    setSideList(Array(newNumSide).fill(null));
    setAppList(Array(newNumApp).fill(null));
    setDrinkList(Array(newNumDrink).fill(null));
    setAlcList(Array(newNumALC).fill(null));

    setIndexEntree(0);
    setIndexSide(0);
    setIndexApp(0);
    setIndexDrink(0);
    setIndexALC(0);

    setShowCreateMealModal(true);
  };
  
  const handleBuyItem = (e) => {
  fetch("/api/buy-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemID: e.target.id }),
     
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("Item bought:", e.target.id);
          UpdatePage();
        }
        else {
          console.log("ERROR: Failed to buy item:", e.target.id);
        }
        //console.log("Cost is: ", data.cost)
      });
  };
  const handleClearItem = (e) => {
  if (debugging) console.log("Remove item clicked");
    //Tells server to clear transaction
    fetch("/api/clear-transaction", {
        method: "delete",
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (debugging) console.log("Transaction cleared");
          //server should be clear at this point so now we update frontend
          UpdatePage();
        }
      });
  }
  const handleRemoveItem = (e) => {
    console.log("Remove item clicked");
  fetch("/api/remove-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index: selectedRow }) // Pass the index in the body
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("Item removed");
          setSelectedRow(null);
          UpdatePage();
        }
        else {
          console.log("ERROR: Failed to remove item at index:", selectedRow);
        }
      });
  }
  const handlePurchase = (e) => {
    console.log("Purchase order");
    fetch("/api/purchase", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("Purchase successful");
          //server should be clear at this point so now we clear frontend
          UpdatePage();
        }
      });
  }

  // Navigate back to the top-level login page (App shows login UI when pathname === '/')
  const handleSignOut = () => navigate('/');
  //modal to confirm sign out
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleReset = () => {
    setShowAlcGUI(false);
    setShowMealGUI(false);
    setShowDrinkGUI(false);
    setShowBottleGUI(false);
    setShowAppGUI(false);
    setShowCreateMealModal(false);
    setAlcMode(false);
  }

  const handleOpenInventory = () => console.log("Open inventory");
  const handleEditMenu = () => console.log("Edit menu");
  const handleEditItems = () => console.log("Edit items");
  const handleOpenEmployee = () => console.log("Open employees");
  const handleViewReports = () => navigate('/reports')
  const handleAddDiscount = () => setShowDiscountModal(true);
  const handleCreateMeal = () => setShowCreateMealModal(true);

  const handleDiscountSubmit = () => {
  fetch("/api/add-discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discountCode }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Discount response:", data);
        if (data.acceptedDiscount === 1) {
          setShowDiscountModal(false);
          //setErrorMessage("");
          if (debugging) console.log("Discount Amount:", data.discountAmount);
          //setDiscountAmount(data.discountAmount);} 
          UpdatePage();
        }
        else if (data.acceptedDiscount === -1) {
    if (debugging) console.log("Cannot apply discount before adding items");
          setErrorMessage("Cannot apply discount before adding items");
          

        }
        else {
          setErrorMessage("Invalid discount code");
          
        }
      });
  };

  //TODO: Make update based on INPUT from CUSTOMIZATION MODAL
  const handleCustomizeOrder = () => {
  if (debugging) console.log("Customize order clicked");
    // Implement customization logic here
    fetch("/api/customize-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index: selectedRow }) // Pass the index in the body
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("Order customized");
          setSelectedRow(null);
          UpdatePage();
        }
      });
  }
  
  

  //Called on page refresh, should update frontend based on what is on the server
  useEffect(() => {
    console.log("Fetching current state from server...");
    
    UpdatePage();
  }, []);
  

  // Scroll to the latest added item whenever transactionItems change
  useEffect(() => {
    if (lastRowRef.current) {
      lastRowRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transactionItems]);

  const UpdatePage = () => {
  fetch("/api/current-state")
      .then((res) => res.json())
      .then((data) => {
        //Formats orders into a flat array for display
        console.log("Current State Data:", data);
        if (Array.isArray(data.orders)) {
          const formattedItems = data.orders.flatMap(order => [
            { cost: order.cost, item: order.item, type: "main"},
            ...(order.entrees ? order.entrees.map(entree => ({ item: (typeof entree === 'string' ? { name: entree } : entree), type: "entree" })) : []),
            ...(order.sides ? order.sides.map(side => ({ item: (typeof side === 'string' ? { name: side } : side), type: "side" })) : [])
          ]);
          console.log("Formatted Items:", formattedItems);
          //updates the front end to show current items
          setTransactionItems(formattedItems);
        } else {
          setTransactionItems([]);
        }
        //Calls functions to update their states
        setCurrCost(data.totalPrice || 0);
        setDiscountAmount(data.discountAmount || 0);
        setDiscountPriceOff(data.priceOff || 0);
      });
  }




  return (
    <div className="main-page bkgColor cashier-container">
      {showCreateMeal && (
      <div className="modal-overlay-meal" 
      style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
      onClick={() => handleReset()}>
        <div className="p-4 space-y-3 modal-menu-container"
        style={{
              background: "#f9f9fb",
              padding: "2.5rem 2rem 2rem 2rem",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              minWidth: "90vw",
              maxWidth: "90vw",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
        onClick={e => e.stopPropagation()}>
          {showMealGUI && (
            <>
              <div className="main-layout">
                <div className="menu-wrapper">
                  <div className="section section-entrees">                
                    <h3 className="section-title">Entrees:</h3>
                    {rows_entree.map((row, rowIndex) => (
                      <div key={rowIndex} className={`menu-row `}>
                        {row.map((item, itemIndex) => (
                          <button
                            key={itemIndex}
                            id={item.name}
                            className="buy-button"
                            //onClick={() => console.log("The item is: " + item.name + " and it costs this much: " + item.cost)}
                            onClick={() => selectAttribute(item)}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>  
                  <div className="section section-sides"> 
                    <h3 className="section-title">Sides:</h3>
                      {rows_side.map((row, rowIndex) => (
                        <div key={rowIndex} className={`menu-row ${rowIndex > 0 ? 'spaced' : ''}`}>
                          {row.map((item, itemIndex) => (
                            <button
                              key={itemIndex}
                              id={item.name}
                              className="buy-button"
                              //onClick={() => console.log("The item is: " + item.name + " and it costs this much: " + item.cost)}
                              onClick={() => selectAttribute(item)}
                            >
                              {item.name}
                            </button>
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
                        <button
                          key={i}
                          className="selected-button"
                          onClick={() => removeIndex(i, "Entree")}
                        >
                          {entreeList[i] ? entreeList[i].name : "NONE"}
                        </button>
                      ))}
                    </div>
                    <div className="selected-group">
                      <h3 className="section-title">Selected Sides</h3>
                      {Array.from({ length: numSide }).map((_, i) => (
                        <button
                          key={i}
                          className="selected-button"
                          onClick={() => removeIndex(i, "Side")}
                        >
                          {sideList[i] ? sideList[i].name : "NONE"}
                        </button>
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
                          <button
                            key={itemIndex}
                            id={item.name}
                            className="buy-button"
                            onClick={() => selectAttribute(item)}
                          >
                            {item.name}
                          </button>
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
                        <button
                          key={i}
                          className="selected-button"
                          onClick={() => removeIndex(i, "Drink")}
                        >
                          {drinkList[i] ? drinkList[i].name : "NONE"}
                        </button>
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
                          <button
                            key={itemIndex}
                            id={item.name}
                            className="buy-button"
                            onClick={() => selectAttribute(item)}
                          >
                            {item.name}
                          </button>
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
                        <button
                          key={i}
                          className="selected-button"
                          onClick={() => removeIndex(i, "Drink")}
                        >
                          {drinkList[i] ? drinkList[i].name : "NONE"}
                        </button>
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
                            <button
                              key={itemIndex}
                              id={item.name}
                              className="buy-button"
                              onClick={() => selectAttribute(item)}
                            >
                              {item.name}
                            </button>
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
                      <button
                        key={i}
                        className="selected-button"
                        onClick={() => removeIndex(i, "A La Carte")}
                      >
                        {alcList[i] ? alcList[i].name : "NONE"}
                      </button>
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
                          <button
                            key={itemIndex}
                            id={item.name}
                            className="buy-button"
                            onClick={() => selectAttribute(item)}
                          >
                            {item.name}
                          </button>
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
                        <button
                          key={i}
                          className="selected-button"
                          onClick={() => removeIndex(i, "Appetizer")}>
                          {appList[i] ? appList[i].name : "NONE"}
                        </button>
                      ))}
                    </div>
              </div>
            </>
            )}

          <button
            className="continue-button"
            onClick={handleFinishSelection}
          >
            Continue
          </button>
        </div> 
      </div>
      )}
      {showDiscountModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDiscountModal(false)}
        >
          <div
            className="modal-window"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="modal-title">Enter Discount Code</h2>
            <input
              type="text"
              value={discountCode}
              onChange={e => setDiscountCode(e.target.value)}
              placeholder="Discount Code"
              className="modal-input"
            />
            <div className="modal-error">{errorMessage}</div>
            <div className="modal-actions">
              <button
                onClick={handleDiscountSubmit}
                className="modal-submit"
              >
                Submit
              </button>
              <button
                onClick={() => setShowDiscountModal(false)}
                className="modal-back"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
      {showSignOutModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowSignOutModal(false)}
            >
          <div className="modal-window" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              <h2>Confirm Sign Out</h2>
            <div>
              Are you sure you want to sign out?
            </div>
            </div>
            <div className= "modal-actions">
              <button className="button" onClick={handleSignOut}>Yes</button>
              <button className="button" onClick={() => setShowSignOutModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
      {/* Sidebar */}
      <div className="sidebar-left" />

      {/* Header bar */}
      <div className="header-bar" style={{zIndex:-1}} />

      {/* Labels */}
      <div className="label-employee">Employee:</div>
      <div className="label-time">Time:</div>

      {/* Order summary area */}
      <div className="order-area">
        <div className="order-table-scroll">
          <table className="orderTable order-table">
            <thead>
              <tr>
                <th>Cost</th>
                <th>Item</th>
              </tr>
            </thead>
            <tbody>
              {/* Group transactionItems by main items, then render each main with its entrees/sides as subrows */}
              {(() => {
                // Build grouped array: [{ main, entrees: [], sides: [] }]
                const grouped = [];
                let i = 0;
                while (i < transactionItems.length) {
                  if (transactionItems[i].type === "main") {
                    const main = transactionItems[i];
                    const group = { main, entrees: [], sides: [] };
                    let j = i + 1;
                    // transactionItems types are lowercase ('entree', 'side') as produced in UpdatePage
                    while (j < transactionItems.length && transactionItems[j].type !== "main") {
                      if (transactionItems[j].type === "entree") group.entrees.push(transactionItems[j]);
                      if (transactionItems[j].type === "side") group.sides.push(transactionItems[j]);
                      j++;
                    }
                    grouped.push(group);
                    i = j;
                  } else {
                    i++;
                  }
                }
                return grouped.map((group, mainIdx) => (
                  // takes group and renders main row plus entrees/sides
                  <React.Fragment key={`group-${mainIdx}`}>
                    <tr
                      key={`main-${mainIdx}`}
                      ref={mainIdx === grouped.length - 1 ? lastRowRef : null}
                      className={mainIdx === selectedRow ? "selected-row" : "clickable-row"}
                      onClick={() => setSelectedRow(mainIdx)}
                    >
                    <td>{`$${group.main.cost}`}</td>
                    <td>{
                      group.main && typeof group.main.item === 'object' && group.main.item !== null
                        ? group.main.item.name
                        : group.main.item
                    }</td>
                    </tr>
                    {/* Render entrees as indented subrows */}
                    {group.entrees.map((entree, eIdx) => {
                      const label = (entree.item && entree.item.displayType) ? entree.item.displayType : 'Entree';
                      const name = (entree.item && entree.item.name) ? entree.item.name : (typeof entree.item === 'string' ? entree.item : 'Select Entree');
                      return (
                        <tr key={`main-${mainIdx}-entree-${eIdx}-${name}`} className="subrow">
                          <td></td>
                          <td style={{ paddingLeft: "2em" }}>{`${label}: ${name}`}</td>
                        </tr>
                      );
                    })}
                    {/* Render sides as indented subrows */}
                    {group.sides.map((side, sIdx) => {
                      const label = (side.item && side.item.displayType) ? side.item.displayType : 'Side';
                      const name = (side.item && side.item.name) ? side.item.name : (typeof side.item === 'string' ? side.item : 'Select Side');
                      return (
                        <tr key={`main-${mainIdx}-side-${sIdx}-${name}`} className="subrow">
                          <td></td>
                          <td style={{ paddingLeft: "2em" }}>{`${label}: ${name}`}</td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ));
              })()}
            </tbody>
          </table>
        </div>

        <div className="order-stats">
          {/* (total price - price off) * discountPercent */}
          <p>Total Cost: ${(currCost).toFixed(2)}</p>
          <p>Discount Amount: ${typeof discountAmount === "number" ? discountAmount.toFixed(2) : "0.00"}</p>
          <p>Tax: ${(currCost * TAXRATE).toFixed(2)}</p>
          <p>Price Total: ${((currCost - (typeof discountAmount === "number" ? discountAmount : 0)) + TAXRATE * currCost).toFixed(2)}</p>
        </div>

        <button onClick={handlePurchase} className="miscButtonFlex purchase-button">
          Purchase
        </button>
      </div>

      {/* Menu buttons */}
      <div className="menu-area">
        <div className="menu-row">
          {["Bowl", "Plate", "Bigger", "Family"].map((item) => ( //Can we set this to be filled by the DB?
            <button key={item} id={item} className="buy-button" onClick={handleBuildItem}>
              {item}
            </button>
          ))}
        </div>
        <div className="menu-row spaced">
          {["A La Carte", "Appetizer"].map((item) => (
            <button key={item} id={item} className="buy-button" onClick={handleBuildItem}>
              {item}
            </button>
          ))}
        </div>
        <div className="menu-row spaced">
          {["Drink", "Bottle"].map((item) => (
            <button key={item} id={item} className="buy-button" onClick={handleBuildItem}>
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* update order buttons */}
      <div className="updateOrder-button-row">
        {/* Render all orderUpdate buttons in a row here */}
        <button onClick={handleRemoveItem} className="UpdateOrderButton">REMOVE</button>
        <button onClick={handleClearItem} className="UpdateOrderButton">CLEAR TRANS</button>
        <button onClick={handleCustomizeOrder} className="UpdateOrderButton">CUSTOMIZE</button>
      </div>

      {/* Function buttons (left sidebar) */}
      <div className="functions-column">
        {[
          { text: "Discount", handler: handleAddDiscount },
          { text: "Reports", handler: handleViewReports },
          // { text: "Inventory", handler: handleOpenInventory },
          // { text: "Employees", handler: handleOpenEmployee },
          // { text: "Edit Items", handler: handleEditItems },
          // { text: "Edit Menu", handler: handleEditMenu },
          { text: "Sign Out", handler: setShowSignOutModal },
        ].map((btn) => (
          <button key={btn.text} onClick={btn.handler} className="function-button">
            {btn.text}
          </button>
        ))}
      </div>
    </div>
  );
}