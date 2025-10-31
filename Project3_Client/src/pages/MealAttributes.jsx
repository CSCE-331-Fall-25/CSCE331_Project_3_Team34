import "../styles/MealAttributes.css";
import { useState } from "react";
export default function MealAttributes() {
  //Items (this should be pulled from the database)
  const items = ["Orange Chicken", "Teriyaki Chicken", "Beijing Beef", "Honey Walnut Shrimp", "Black Pepper Steak", "Sesame Chicken", "Butter Chicken", "Black Pepper Angus Beef"];
  

  // TODO: Replace these with actual React state or backend calls
  const [transactionItems, setTransactionItems] = useState([]);
  const handleChooseItem = (e) => {
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
  
  //const handleViewReports = () => console.log("View reports");
  
  const rows = [];
  for (let i = 0; i < items.length; i += 4) {
    rows.push(items.slice(i, i + 4));
  }

  return (
    <div className="p-4 space-y-3 container">

      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={`menu-row ${rowIndex > 0 ? 'spaced' : ''}`}>
          {row.map((item, itemIndex) => (
            <button
              key={itemIndex}
              id={item}
              className="buy-button"
              onClick={() => console.log("The item is: " + item)}
            >
              {item}
            </button>
          ))}
        </div>
      ))}       
    </div> 
  );
}
