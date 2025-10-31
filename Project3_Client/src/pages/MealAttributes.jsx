import "../styles/MealAttributes.css";
import { useState } from "react";
export default function MealAttributes({numEntree = 2, numSides = 1}) {

  //Items (this should be pulled from the database)
  function foodItem(name, cost, calories, premium, ID, type) {
    this.name = name;
    this.cost = cost;
    this.calories = calories;
    this.premium = premium;
    this.ID = ID;
    this.type = type;
  } 

  const [entreeList, setEntreeList] = useState(() => Array(numEntree).fill(null));
  const [sideList, setSideList] = useState(() => Array(numSides).fill(null));
  const [indexEntree, setIndexEntree] = useState(0);
  const [indexSide, setIndexSide] = useState(0); 

  //const items = ["Orange Chicken", "Teriyaki Chicken", "Beijing Beef", "Honey Walnut Shrimp", "Black Pepper Steak", "Sesame Chicken", "Butter Chicken", "Black Pepper Angus Beef"];
  const items = [];
  
  const items_sides = [];
  const items_entrees = [];

  // TODO: Use for loop to populate this list
  items.push(new foodItem("Orange Chicken", 0.0, 400, true, 67, "entree"))
  items.push(new foodItem("Teriyaki Chicken", 0.0, 400, true, 68, "entree"))

  for (let i = 0; i < items.length; i++) {
    if (items.at(i).type == "entree") {
      items_entrees.push(items.at(i));
    } else {
      items_sides.push(items.at(i));
    }
  }

  const finished = (indexEntree === numEntree) && (indexSide === numSides);

  // TODO: Replace these with actual React state or backend calls
  const handleFinishSelection = () => {
    if (finished) {
      fetch("http://localhost:5000/api/buy-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entreeList, sideList }),
      })
    }
  };

  const selectEntree = (item) => {
    const updated = [...entreeList];
    if (indexEntree < numEntree) {
      updated[indexEntree] = item;
        
      setEntreeList(updated);
      setIndexEntree(indexEntree + 1)

      console.log("Item Added: " + item.name);
    } else {
      console.log("No more slots")
    }

    console.log("Current Entree List and index: ")
    updated.forEach((e) => console.log(e ? e.name : "empty"));
    console.log("Slots Left: " + indexEntree + "/" + numEntree);
  }

  const selectSide = (item) => {
    const updated_side = [...sideList];
    if (indexSide < numSide) {
      updated_side[indexSide] = item;
        
      setSideList(updated_side);
      setIndexSide(indexSide + 1)

      console.log("Item Added: " + item.name);
    } else {
      console.log("No more slots")
    }

    console.log("Current Side List and index: ")
    updated_side.forEach((e) => console.log(e ? e.name : "empty"));
    console.log("Slots Left: " + indexSide + "/" + numSide);
  }

  
  const rows_entree = [];
  for (let i = 0; i < items_entrees.length; i += 5) {
    rows_entree.push(items_entrees.slice(i, i + 5));
  }

  return (
    <div className="p-4 space-y-3 container">

      {rows_entree.map((row, rowIndex) => (
        <div key={rowIndex} className={`menu-row ${rowIndex > 0 ? 'spaced' : ''}`}>
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
  );
}
