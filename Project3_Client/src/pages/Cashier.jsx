import React from "react";
import "../styles/Cashier.css";
import "../styles/DiscountModal.css";
import { useEffect, useState, useRef } from "react";
export default function Cashier() {
  //newestRowRef for scrolling
  const lastRowRef = useRef(null);
  //handles selected row of items
  const [selectedRow, setSelectedRow] = useState(null);
  //Discount buttons
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPriceOff, setDiscountPriceOff] = useState(0);
  const [currCost, setCurrCost] = useState(0);
  const [currOrderNumber, setCurrOrderNumber] = useState(1);
  const taxRate = 0.0825;
  const [discountError, setDiscountError] = useState("");
  // TODO: Replace these with actual React state or backend calls
  const [transactionItems, setTransactionItems] = useState([]);
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
            { cost: data.cost, item: data.item, type: "main", currOrderNumber: data.orderNumber },
            ...data.entrees.map((entree) => ({ item: entree, type: "entree" })),
            ...data.side.map((side) => ({ item: side, type: "side" }))
          ]);
          setCurrCost((prev) => prev + data.cost);
          setCurrOrderNumber(currOrderNumber);
          UpdatePage();
        }
        //console.log("Cost is: ", data.cost)
      });
  };
  //TODO: update remove, currently a clear button
  const handleClearItem = (e) => {
    console.log("Remove item clicked");
    //Tells server to clear transaction
    fetch("http://localhost:5000/api/clear-transaction", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("Transaction cleared");
          //server should be clear at this point so now we clear frontend
          ResetPage();
        }
      });
  }
  const handleRemoveItem = (e) => {
    console.log("Remove item clicked");
    fetch("http://localhost:5000/api/remove-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index: selectedRow }) // Pass the index in the body
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("Item removed");
          UpdatePage();
        }
      });
  }
  const handlePurchase = (e) => {
    console.log("Purchase order");
    fetch("http://localhost:5000/api/purchase", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("Purchase successful");
          //server should be clear at this point so now we clear frontend
          ResetPage();
        }
      });
  }
  const handleSignOut = () => console.log("Sign out");
  const handleOpenInventory = () => console.log("Open inventory");
  const handleEditMenu = () => console.log("Edit menu");
  const handleEditItems = () => console.log("Edit items");
  const handleOpenEmployee = () => console.log("Open employees");
  const handleVoidItem = () => console.log("Void item");
  const handleViewReports = () => console.log("View reports");
  const handleAddDiscount = () => setShowDiscountModal(true);

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
          console.log("Discount Amount:", data.discountAmount);
          setDiscountAmount(data.discountAmount);} 
        else if (data.acceptedDiscount === -1) {
          setDiscountError("Cannot apply discount before adding items");
        }
        else {
          setDiscountError("Invalid discount code");
        }
      });
  };

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
    fetch("http://localhost:5000/api/current-state")
      .then((res) => res.json())
      .then((data) => {
        //Formats orders into a flat array for display
        if (Array.isArray(data.orders)) {
          const formattedItems = data.orders.flatMap(order => [
            { cost: order.cost, item: order.item, type: "main", currOrderNumber: order.orderNumber },
            ...(order.entrees ? order.entrees.map(entree => ({ item: entree, type: "entree" })) : []),
            ...(order.side ? order.side.map(side => ({ item: side, type: "side" })) : [])
          ]);
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

  // Scroll to the latest added item whenever transactionItems change
  useEffect(() => {
    if (lastRowRef.current) {
      lastRowRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transactionItems]);

  const ResetPage = () => {
  setTransactionItems([]);
  setCurrCost(0);
  setDiscountAmount(0);
  }  

  return (
    <div className="main-page bkgColor cashier-container">
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
            <div className="modal-error">{discountError}</div>
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
      {/* Sidebar */}
      <div className="sidebar-left" />

      {/* Header bar */}
      <div className="header-bar" />

      {/* Labels */}
      <div className="label-employee">Employee:</div>
      <div className="label-time">Time:</div>

      {/* Order summary area */}
      <div className="order-area">
        <p className="order-title">ORDER: # {currOrderNumber}</p>
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
                  <React.Fragment key={`group-${mainIdx}`}>
                    <tr
                      key={`main-${mainIdx}`}
                      ref={mainIdx === grouped.length - 1 ? lastRowRef : null}
                      className={mainIdx === selectedRow ? "selected-row" : "clickable-row"}
                      onClick={() => setSelectedRow(mainIdx)}
                    >
                      <td>{`$${group.main.cost}`}</td>
                      <td>{group.main.item}</td>
                    </tr>
                    {/* Render entrees as indented subrows */}
                    {group.entrees.map((entree, eIdx) => (
                      <tr key={`main-${mainIdx}-entree-${eIdx}-${entree.item}`} className="subrow">
                        <td></td>
                        <td style={{ paddingLeft: "2em" }}>{`Entree: ${entree.item}`}</td>
                      </tr>
                    ))}
                    {/* Render sides as indented subrows */}
                    {group.sides.map((side, sIdx) => (
                      <tr key={`main-${mainIdx}-side-${sIdx}-${side.item}`} className="subrow">
                        <td></td>
                        <td style={{ paddingLeft: "2em" }}>{`Side: ${side.item}`}</td>
                      </tr>
                    ))}
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
          <p>Tax: ${(currCost * taxRate).toFixed(2)}</p>
          <p>Price Total: ${((currCost - (typeof discountAmount === "number" ? discountAmount : 0)) + taxRate * currCost).toFixed(2)}</p>
        </div>

        <button onClick={handlePurchase} className="miscButtonFlex purchase-button">
          Purchase
        </button>
      </div>

      {/* Menu buttons */}
      <div className="menu-area">
        <div className="menu-row">
          {["Bowl", "Plate", "Bigger", "Family"].map((item) => ( //Can we set this to be filled by the DB?
            <button key={item} id={item} className="buy-button" onClick={handleBuyItem}>
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
      <div className="misc-buttons-row">
        <button onClick={handleRemoveItem} className="miscButtonFlex remove-button">
          REMOVE
        </button>
        <button onClick={ResetPage} className="miscButtonFlex clear-button">
          CLEAR TRANS
        </button>
      </div>

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
