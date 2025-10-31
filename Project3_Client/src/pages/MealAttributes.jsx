import "../styles/MealAttributes.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function MealAttributes({itemType = "bowl", numEntree = 3, numSides = 2}) {

  const navigate = useNavigate();

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

  const finished = (indexEntree === numEntree) && (indexSide === numSides);

  // TODO: Replace these with actual React state or backend calls
  const handleFinishSelection = () => {
    if (finished) {
      fetch("http://localhost:5000/api/buy-item", { // create item!
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entreeList, sideList }),
      })

      console.log("The Item is a " + itemType + " and it contains: ");
      entreeList.forEach((e) => console.log(e ? e.name : "empty"));
      sideList.forEach((e) => console.log(e ? e.name : "empty"));

      navigate("/Cashier");
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
    if (indexSide < numSides) {
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
    console.log("Slots Left: " + updated_sideIndex + "/" + numSides);
  }

  const removeIndex = (i, type) => {
    if (type === "entree") {
      const updated = [...entreeList];
      updated[i] = null; // remove the selected item
      setEntreeList(updated);
      setIndexEntree(Math.max(indexEntree - 1, 0));
    } else if (type === "side") {
      const updated = [...sideList];
      updated[i] = null; // remove the selected item
      setSideList(updated);
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

  return (
    <div className="p-4 space-y-3 container">

      <div className="main-layout">
        <div className="menu-wrapper">
          <div className="section section-entrees">

            <h3 className="section-title">Entrees:</h3>

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
            {/* Selected Entrees */}
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

            {/* Selected Sides */}
            <div className="selected-group">
              <h3 className="section-title">Selected Sides</h3>
              {Array.from({ length: numSides }).map((_, i) => (
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

    
  );
}
