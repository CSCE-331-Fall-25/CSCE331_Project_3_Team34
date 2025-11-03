import "../styles/Cashier.css";
import { useState } from "react";
export default function Cashier() {

  //Discount buttons
  const [showCreateMeal, setShowCreateMealModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountPriceOff, setDiscountPriceOff] = useState(0);
  const [currCost, setCurrCost] = useState(0);
  const taxRate = 0.0825;
  const [discountError, setDiscountError] = useState("");
  // TODO: Replace these with actual React state or backend calls
  const [transactionItems, setTransactionItems] = useState([]);

  const [numEntree, setNumEntree] = useState(0);
  const [numSide, setNumSide] = useState(0);
  
  const [entreeList, setEntreeList] = useState(() => Array(numEntree).fill(null));
  const [sideList, setSideList] = useState(() => Array(numSide).fill(null));
  const [indexEntree, setIndexEntree] = useState(0);
  const [indexSide, setIndexSide] = useState(0); 

  const items = [];
  
  const items_sides = [];
  const items_entrees = [];

  
  function foodItem(name, cost, calories, premium, ID, type) {
    this.name = name;
    this.cost = cost;
    this.calories = calories;
    this.premium = premium;
    this.ID = ID;
    this.type = type;
  } 

  // TODO: Use for loop to populate this list, USE DATABASE!!!!
  items.push(new foodItem("Orange Chicken", 0.0, 400, true, 67, "entree"))
  items.push(new foodItem("Teriyaki Chicken", 0.0, 400, true, 68, "entree"))
  items.push(new foodItem("Butter Chicken", 0.0, 400, true, 67, "entree"))
  items.push(new foodItem("Bejing Beef", 0.0, 400, true, 68, "entree"))
  items.push(new foodItem("Black Pepper Angus Beef", 0.0, 400, true, 67, "entree"))
  items.push(new foodItem("String Bean Chicken", 0.0, 400, true, 68, "entree"))

  items.push(new foodItem("Fried Rice", 0.0, 400, true, 69, "side"))
  items.push(new foodItem("Chow Mein", 0.0, 400, true, 70, "side"))

  for (let i = 0; i < items.length; i++) {
    if (items.at(i).type == "entree") {
      items_entrees.push(items.at(i));
    } else {
      items_sides.push(items.at(i));
    }
  }

  const finished = (indexEntree === numEntree) && (indexSide === numSide);

  // TODO: Replace these with actual React state or backend calls
  const handleFinishSelection = () => {
    if (finished) {

      // TODO: CREATE THE TRAY TO ADD TRANSACTION LIST!!! ALL YOUR INFORMATION IS PRINTED BELOW!
      
      entreeList.forEach((e) => console.log(e ? e.name : "empty"));
      sideList.forEach((e) => console.log(e ? e.name : "empty"));

      setShowCreateMealModal(false);
    }
    else {
      console.log("Finish Adding Items!");
    }
  };

  const selectEntree = (item) => {
    const updated = [...entreeList];
    let updatedIndex = indexEntree;
    if (indexEntree < numEntree) {
      updated[indexEntree] = item;
      updatedIndex = indexEntree + 1; 
        
      setEntreeList(updated);
      setIndexEntree(indexEntree + 1)

      console.log("Item Added: " + item.name);
    } else {
      console.log("No more slots")
    }

    console.log("Current Entree List and index: ")
    updated.forEach((e) => console.log(e ? e.name : "empty"));
    console.log("Slots Left: " + updatedIndex + "/" + numEntree);
  }

  const selectSide = (item) => {
    const updated_side = [...sideList];
    let updated_sideIndex = indexSide;
    if (indexSide < numSide) {
      updated_side[indexSide] = item;
      updated_sideIndex = indexSide + 1;
      setSideList(updated_side);
      setIndexSide(indexSide + 1)

      console.log("Item Added: " + item.name);
    } else {
      console.log("No more slots")
    }

    console.log("Current Side List and index: ")
    updated_side.forEach((e) => console.log(e ? e.name : "empty"));
    console.log("Slots Left: " + updated_sideIndex + "/" + numSide);
  }

  const removeIndex = (i, type) => {
    if (type === "entree") {
      const updated = [...entreeList];
      updated[i] = null; 

      const compact = updated.filter(x => x !== null);

      while (compact.length < numSide) {
        compact.push(null);
      }

      setEntreeList(compact);
      setIndexEntree(Math.max(indexEntree - 1, 0));
    } else if (type === "side") {
      const updated = [...sideList];      
      updated[i] = null; // remove the selected item

      const compact = updated.filter(x => x !== null);

      while (compact.length < numSide) {
        compact.push(null);
      }

      setSideList(compact);
      setIndexSide(Math.max(indexSide - 1, 0));
    }
    
  };
 
  const rows_entree = [];
  for (let i = 0; i < items_entrees.length; i += 5) {
    rows_entree.push(items_entrees.slice(i, i + 5));
  }

  const rows_side = [];
  for (let i = 0; i < items_sides.length; i += 5) {
    rows_side.push(items_sides.slice(i, i + 5));
  }

  const handleBuildItem = (e) => {
    switch(e.target.id) {
      case "Bowl":
        setNumEntree(1);
        setNumSide(1);
        break;
      case "Plate":
        setNumEntree(2);
        setNumSide(1);
        break;
      break;
    }

    setEntreeList(Array(numEntree).fill(null));
    setSideList(Array(numSide).fill(null));
    setIndexEntree(0);
    setIndexSide(0);

    console.log("numEntrees: " + numEntree + ", Sides: " + numSide)
    setShowCreateMealModal(true);
  };
  
  const handleBuyItem = (e) => {
    //console.log("Item Button ID: " + e.target.id);
    fetch("http://localhost:5000/api/buy-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemID: e.target.id }),
     
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("Item bought:", e.target.id);
          setTransactionItems((prev) => [
            ...prev,
            { cost: data.cost, item: data.item, type: "main" },
            ...data.entrees.map((entree) => ({ item: entree, type: "entree" })),
            ...data.side.map((side) => ({ item: side, type: "side" }))
          ]);
          setCurrCost((prev) => prev + data.cost);
        }
        //console.log("Cost is: ", data.cost)
      });
  };

  const handleRemoveItem = () => console.log("Remove item");
  const handlePurchase = () => console.log("Purchase order");
  const handleSignOut = () => console.log("Sign out");
  const handleOpenInventory = () => console.log("Open inventory");
  const handleEditMenu = () => console.log("Edit menu");
  const handleEditItems = () => console.log("Edit items");
  const handleOpenEmployee = () => console.log("Open employees");
  const handleVoidItem = () => console.log("Void item");
  const handleViewReports = () => console.log("View reports");
  const handleAddDiscount = () => setShowDiscountModal(true);
  const handleCreateMeal = () => setShowCreateMealModal(true);

  const handleDiscountSubmit = () => {
    fetch("http://localhost:5000/api/add-discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discountCode }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Discount response:", data);
        if (data.acceptedDiscount) {
          setShowDiscountModal(false);
          setDiscountError("");
          // Only update discountPercent if new value is greater
          console.log("Discount percent:", data.discountPer);
          setDiscountPercent(data.discountPer);
        } 
        else if (data.acceptedDiscount === -1) {
          setDiscountError("Cannot apply discount before adding items");
        }
        else {
          setDiscountError("Invalid discount code");
        }
      });
  };


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
      onClick={() => setShowCreateMealModal(false)}>
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
                        onClick={() => selectEntree(item)}
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
                          onClick={() => selectSide(item)}
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
                      onClick={() => removeIndex(i, "entree")}
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
                      onClick={() => removeIndex(i, "side")}
                    >
                      {sideList[i] ? sideList[i].name : "NONE"}
                    </button>
                  ))}
                </div>
          </div>

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
          onClick={() => setShowDiscountModal(false)}
        >
          <div
            className="modal-window"
            style={{
              background: "#f9f9fb",
              padding: "2.5rem 2rem 2rem 2rem",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              minWidth: "340px",
              maxWidth: "90vw",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Enter Discount Code</h2>
            <input
              type="text"
              value={discountCode}
              onChange={e => setDiscountCode(e.target.value)}
              placeholder="Discount Code"
              style={{
                width: "100%",
                marginBottom: "1rem",
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "1rem"
              }}
            />
            <div style={{ color: "red", textAlign: "center", minHeight: "1.5em" }}>{discountError}</div>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: "1.5rem" }}>
              <button
                onClick={handleDiscountSubmit}
                style={{
                  padding: "0.5rem 1.5rem",
                  borderRadius: "6px",
                  border: "none",
                  background: "#007bff",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
              >
                Submit
              </button>
              <button
                onClick={() => setShowDiscountModal(false)}
                style={{
                  padding: "0.5rem 1.5rem",
                  borderRadius: "6px",
                  border: "none",
                  background: "#eee",
                  color: "#333",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
              >
                Back
              </button>
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
        <p className="order-title">ORDER: #</p>
        <table className="orderTable order-table">
          <thead>
            <tr>
              <th>Cost</th>
              <th>Item</th>
            </tr>
          </thead>
          <tbody> 
            {/* make into a scrollable table */}
            {transactionItems.map((row, idx) => (
              <tr key={idx}>
                <td>
                  {row.type === "main" ? `$${row.cost}` : ""}
                </td>
                <td>
                  {row.type === "main" ? row.item : row.type === "entree" ? `Entree: ${row.item}` : `Side: ${row.item}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="order-stats">
          {/* (total price - price off) * discountPercent */}
          <p>Total Cost: ${(currCost).toFixed(2)}</p>
          <p>Discount: ${((discountPercent || 0) * currCost).toFixed(2)}</p> 
          <p>Tax:${(currCost * taxRate).toFixed(2)}</p>
          <p>Price Total: ${((currCost - ((discountPercent || 0) * currCost)) + taxRate * currCost).toFixed(2)}</p>
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
          {["A'La Carte", "Appetizer"].map((item) => (
            <button key={item} id={item} className="buy-button" onClick={handleBuyItem}>
              {item}
            </button>
          ))}
        </div>
        <div className="menu-row spaced">
          {["SM Drink", "MD Drink", "LG Drink", "Bottle"].map((item) => (
            <button key={item} id={item} className="buy-button" onClick={handleBuyItem}>
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Misc button */}
      <button onClick={handleRemoveItem} className="miscButtonFlex remove-button">
        REMOVE
      </button>

      {/* Function buttons (left sidebar) */}
      <div className="functions-column">
        {[
          { text: "Discount", handler: handleAddDiscount },
          { text: "Reports", handler: handleViewReports },
          { text: "Inventory", handler: handleOpenInventory },
          { text: "Employees", handler: handleOpenEmployee },
          { text: "Edit Items", handler: handleEditItems },
          { text: "Edit Menu", handler: handleEditMenu },
          { text: "Void", handler: handleVoidItem },
          { text: "Sign Out", handler: handleSignOut },
        ].map((btn) => (
          <button key={btn.text} onClick={btn.handler} className="function-button">
            {btn.text}
          </button>
        ))}
      </div>
    </div>
  );
}
