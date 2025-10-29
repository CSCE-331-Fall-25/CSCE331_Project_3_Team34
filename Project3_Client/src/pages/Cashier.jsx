import "../styles/Cashier.css";
import "../styles/DiscountModal.css";
import { useEffect, useState } from "react";
export default function Cashier() {
  //Discount buttons
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
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
        }
        //console.log("Cost is: ", data.cost)
      });
  };
  //TODO: update remove, currently a clear button
  const handleRemoveItem = (e) => {
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
  const handlePurchase = () => console.log("Purchase order");
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

  //Called on page refresh, should update frontend based on what is on the server
  useEffect(() => {
    console.log("Fetching current state from server...");
    fetch("http://localhost:5000/api/current-state")
      .then((res) => res.json())
      .then((data) => {
        //console.log("Current state data:", data);
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
        setDiscountPercent(data.discountRate || 0);
        setDiscountPriceOff(data.priceOff || 0);
      });
  }, []);

  const ResetPage = () => {
    setTransactionItems([]);
    setCurrCost(0);
    setDiscountPercent(0);
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
