import "../styles/Cashier.css";

export default function Cashier() {
  // TODO: Replace these with actual React state or backend calls
  const handleBuyItem = (e) => console.log("Buy:", e.target.id);
  const handleRemoveItem = () => console.log("Remove item");
  const handlePurchase = () => console.log("Purchase order");
  const handleSignOut = () => console.log("Sign out");
  const handleOpenInventory = () => console.log("Open inventory");
  const handleEditMenu = () => console.log("Edit menu");
  const handleEditItems = () => console.log("Edit items");
  const handleOpenEmployee = () => console.log("Open employees");
  const handleVoidItem = () => console.log("Void item");
  const handleViewReports = () => console.log("View reports");
  const handleAddDiscount = () => console.log("Add discount");

  return (
    <div className="main-page bkgColor cashier-container">
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
            {/* Example row */}
            <tr>
              <td>$9.99</td>
              <td>Orange Chicken</td>
            </tr>
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
          {["Bowl", "Plate", "Bigger", "Family"].map((item) => (
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
