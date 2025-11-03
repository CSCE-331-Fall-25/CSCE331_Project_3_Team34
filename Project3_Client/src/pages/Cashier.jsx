import React from "react";
import "../styles/Cashier/Cashier.css";
import "../styles/Cashier/DiscountModal.css";
import { useEffect, useState, useRef } from "react";
import CashierMainPage from "../../../Project3_Server/src/MainPage.js";
import { useNavigate } from 'react-router-dom';
export default function Cashier() {
  const navigate = useNavigate();
  //newest Row reference for auto scrolling
  const lastRowRef = useRef(null);
  //handles selected row of items (used for removal/customization)
  const [selectedRow, setSelectedRow] = useState(null);
  //Discount buttons
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPriceOff, setDiscountPriceOff] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  //updates for orderTable
  const [currCost, setCurrCost] = useState(0);
  const [currOrderNumber, setCurrOrderNumber] = useState(1);
  const TAXRATE = 0.0825;
  const [transactionItems, setTransactionItems] = useState([]);

  //Button Functions
  //TODO: Make update based on INPUT from CUSTOMIZATION MODAL (get information to start the order)
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
    if(CashierMainPage.debugging)console.log("Remove item clicked");
    //Tells server to clear transaction
    fetch("/api/clear-transaction", {
        method: "delete",
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if(CashierMainPage.debugging)console.log("Transaction cleared");
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

  const handleSignOut = () => console.log("Sign out");
  const handleOpenInventory = () => console.log("Open inventory");
  const handleEditMenu = () => console.log("Edit menu");
  const handleEditItems = () => console.log("Edit items");
  const handleOpenEmployee = () => console.log("Open employees");
  const handleViewReports = () => navigate('/reports')
  const handleAddDiscount = () => setShowDiscountModal(true);

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
          if(CashierMainPage.debugging)console.log("Discount Amount:", data.discountAmount);
          //setDiscountAmount(data.discountAmount);} 
          UpdatePage();
        }
        else if (data.acceptedDiscount === -1) {
          if(CashierMainPage.debugging)console.log("Cannot apply discount before adding items");
          setErrorMessage("Cannot apply discount before adding items");
          

        }
        else {
          setErrorMessage("Invalid discount code");
          
        }
      });
  };

  //TODO: Make update based on INPUT from CUSTOMIZATION MODAL
  const handleCustomizeOrder = () => {
    if(CashierMainPage.debugging)console.log("Customize order clicked");
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
        if (Array.isArray(data.orders)) {
          const formattedItems = data.orders.flatMap(order => [
            { cost: order.cost, item: order.item, type: "main", currOrderNumber: order.orderNumber },
            ...(order.entrees ? order.entrees.map(entree => ({ item: entree, type: "entree" })) : []),
            ...(order.side ? order.side.map(side => ({ item: side, type: "side" })) : [])
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
            <button key={item} id={item} className="buy-button" onClick={handleBuyItem}>
              {item}
            </button>
          ))}
        </div>
        <div className="menu-row spaced">
          {["A La Carte", "Appetizer"].map((item) => (
            <button key={item} id={item} className="buy-button" onClick={handleBuyItem}>
              {item}
            </button>
          ))}
        </div>
        <div className="menu-row spaced">
          {["Small Drink", "Medium Drink", "Large Drink", "Bottle"].map((item) => (
            <button key={item} id={item} className="buy-button" onClick={handleBuyItem}>
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
          { text: "Inventory", handler: handleOpenInventory },
          { text: "Employees", handler: handleOpenEmployee },
          { text: "Edit Items", handler: handleEditItems },
          { text: "Edit Menu", handler: handleEditMenu },
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