import "../styles/Cashier.css";
import { useState } from "react";
export default function Cashier() {
  //Discount buttons
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
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
            { cost: data.cost, item: data.item, type: "main" },
            ...data.entrees.map((entree) => ({ item: entree, type: "entree" })),
            ...data.side.map((side) => ({ item: side, type: "side" }))
          ]);
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

  const handleDiscountSubmit = () => {
    fetch("http://localhost:5000/api/add-discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discountCode }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.acceptedDiscount) {
          setShowDiscountModal(false);
          setDiscountError("");
        } else {
          setDiscountError("Invalid discount code");
        }
      });
  };

  const orderItems = [
    { cost: 9.99, item: "Orange Chicken" },
    // Add more items as needed
  ];

  return (
    <div className="main-page bkgColor cashier-container">
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
      <div className="header-bar" />

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
          <p>Discount:</p>
          <p>Total Cost:</p>
          <p>Tax:</p>
          <p>Price Total:</p>
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
