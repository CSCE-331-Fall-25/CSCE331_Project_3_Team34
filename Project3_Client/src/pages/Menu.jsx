import React, { useEffect, useState } from 'react';
import "../styles/Menu/Menu.css";
import pandaLogo from '../assets/PandaLogo.svg';

import { getImageForItem } from "../assets/utils/imageMapper";



import { useNavigate } from 'react-router-dom';
//component imports
import SignOutButton from '../Components/SignOut.jsx';
export default function Menu() {
  // Router navigation for sign out
   const navigate = useNavigate();
   const handleSignOut = () => navigate('/');
   // modal to confirm sign out
   const [showSignOutModal, setShowSignOutModal] = useState(false);
   const [extraMenus, setExtraMenus] = useState([]);
   const [allItems, setAllItems] = useState([]);

  
  const ListEntrees = [];
  const ListSides = [];
  const ListApps = [];
  const ListDrinks = [];
  
  
  const item_list = [];
  const itemRowSize = 8;

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

  const fetchAllItems = async (type) => {
    try {
      const response = await fetch("/api/fetch-all-items", {
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
      const fetchedItems = await fetchAllItems();
      if (!mounted) return;
      // fetched lists may be arrays of plain objects with name/type
      setExtraMenus([...(fetchedEntrees || []), ...(fetchedSides || []), ...(fetchedApps || []), ...(fetchedDrinks || [])]);
      setAllItems(fetchedItems || []);
    })();
    return () => { mounted = false; };
  }, []);

  const combinedItems = [...extraMenus];
  for (let i = 0; i < combinedItems.length; i++) {
    const t = (combinedItems[i].type || '').toLowerCase();
    if (t === 'entree') {
      ListEntrees.push(combinedItems[i]);
    } else if (t === 'side') {
      ListSides.push(combinedItems[i]);
    } else if (t === 'appetizer' || t === 'app') {
      ListApps.push(combinedItems[i]);
    } else if (t === 'drink') {
      ListDrinks.push(combinedItems[i]);
    } else {
      // unknown type: push to sides as a fallback
      items_sides.push(combinedItems[i]);
    }
  }

  const ListItems = allItems;
  

  return (
    <div className="mainBackground">
      <div className="header-container">
      {/* <div className="side left-text">Panda Express</div> */}

      <div className="center-logo">
        <img src={pandaLogo} alt="Panda Logo" className="logo" />
      </div>

      {/* <div className="side right-text">Menu</div> */}
    </div>
      <div className="menu-page-container">
        {showSignOutModal && <SignOutButton />}
        <div className="menu-content">

          {/* COLUMN 1 – MENU ITEMS */}
          <div className="column">
            <div className="menu-section">
              <h3 className="section-title">Menu Items</h3>

              <div className="section-grid">
                {ListItems.map(item => (
                  <div key={item.itemID} className="menu-item">
                    <img src={getImageForItem(item.itemName)} alt={item.itemName} className="menu-item-image" />
                    <div className="menu-item-name">{item.itemName}</div>
                    <div className="menu-item-price">${item.itemPrice?.toFixed(2) || ''}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 2 – ENTREES */}
          <div className="column">
            <div className="menu-section">
              <h3 className="section-title">Entrees</h3>

              <div className="section-grid">
                {ListEntrees.map(item => (
                  <div key={`entree-${item.menuID}`} className="menu-item">
                    <img src={getImageForItem(item.menuName)} alt={item.menuName} className="menu-item-image" />
                    <div className="menu-item-name">{item.menuName}</div>
                    {item.priceMod > 0 && (
                      <img src={getImageForItem("P")} alt="Premium" className="menu-item-image-premium" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 3 – SIDES + APPETIZERS */}
          <div className="column">

            {/* SIDES */}
            <div className="menu-section">
              <h3 className="section-title">Sides</h3>

              <div className="section-grid">
                {ListSides.map(item => (
                  <div key={`side-${item.menuID}`} className="menu-item">
                    <img src={getImageForItem(item.menuName)} alt={item.menuName} className="menu-item-image" />
                    <div className="menu-item-name">{item.menuName}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* APPETIZERS */}
            <div className="menu-section">
              <h3 className="section-title">Appetizers</h3>

              <div className="section-grid">
                {ListApps.map(item => (
                  <div key={`app-${item.menuID}`} className="menu-item">
                    <img src={getImageForItem(item.menuName)} alt={item.menuName} className="menu-item-image" />
                    <div className="menu-item-name">{item.menuName}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
        {/* FULL-WIDTH BEVERAGES ROW */}
          <div className="beverage-row">
            <div className="beverage-grid">
              {ListDrinks.map(item => (
                <div key={`bev-${item.menuID}`} className="menu-item">
                  <img src={getImageForItem(item.menuName)} alt={item.menuName} className="menu-item-image" />
                  <div className="menu-item-name">{item.menuName}</div>
                </div>
              ))}
            </div>
          </div>
          <br></br>
    <button className = "sign-out-button" onClick={() => setShowSignOutModal(true)}>Sign Out</button>
      </div>
    </div>
  );
}