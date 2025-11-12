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

  const items = []; 
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

  // Fetch extra menus once on mount and merge with baseItems
  useEffect(() => {
    let mounted = true;
    (async () => {
      const fetchedEntrees = await fetchMenusByType("entree");
      const fetchedSides = await fetchMenusByType("side");
      const fetchedApps = await fetchMenusByType("appetizer");
      const fetchedDrinks = await fetchMenusByType("drink");
      if (!mounted) return;
      // fetched lists may be arrays of plain objects with name/type
      setExtraMenus([...(fetchedEntrees || []), ...(fetchedSides || []), ...(fetchedApps || []), ...(fetchedDrinks || [])]);
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

  
  const ListItems = [
    // Placeholder for menu items
    { id: 1, name: "Bowl", type: "Item", image: pandaLogo, price: 5.00 },
    { id: 2, name: "Plate", type: "Item", image: pandaLogo, price: 7.00 },
    { id: 3, name: "Kid's Meal", type: "Item", image: pandaLogo, price: 4.50 },

  ];
  // const ListEntrees = [
  //   // Placeholder for menu items
  //   { id: 1, name: "Orange Chicken", type: "Entree", image: pandaLogo },
  //   { id: 2, name: "Beef Broccoli", type: "Entree", image: pandaLogo },
  //   { id: 3, name: "Kung Pao Chicken", type: "Entree", image: pandaLogo },

  // ];
  // const SideItems = [
  //   // Placeholder for side items
  //   { id: 1, name: "Fried Rice", type: "Side", image: pandaLogo },
  //   { id: 2, name: "Chow Mein", type: "Side", image: pandaLogo },

  // ];
  // const ALaCarteItems = [
  //   // Placeholder for a la carte items
  //   { id: 1, name: "Egg Roll", type: "A La Carte", image: pandaLogo, price: 2.00 },

  // ];
  // const BeverageItems = [
  //   // Placeholder for beverage items
  //   { id: 1, name: "Soda", type: "Beverage", image: pandaLogo, price: 1.50 },
  // ];

  return (
    <div className="menu-page-container">
       {showSignOutModal && <SignOutButton />}
      <div className="menu-content">
        <div className="menu-list items-list">
          <h3>Menu Items</h3>
          {ListItems.map(item => (
            <div key={item.id} className="menu-item">
              <img src={item.image || pandaLogo} alt={item.name} className="menu-item-image" />
              <div className="menu-item-name">{item.name}</div>
              <div className="menu-item-price">${item.price?.toFixed(2) || ''}</div>
            </div>
          ))}
        </div>
        <div className="menu-list entree-list">
          <h3>Entrees</h3>
          
          {ListEntrees.map(item => (
            <div key={`entree-${item.menuID}`} className="menu-item">
              <img src={getImageForItem(item.menuName)} alt={item.menuName} className="menu-item-image" />
              <div className="menu-item-name">{item.menuName}</div>
            </div>
          ))}
        </div>
        <div className="menu-list side-list">
          <h3>Sides</h3>
          {ListSides.map(item => (
            <div key={`side-${item.menuID}`} className="menu-item">
              <img src={getImageForItem(item.menuName)} alt={item.menuName} className="menu-item-image" />
              <div className="menu-item-name">{item.menuName}</div>
            </div>
          ))}
        </div>
        <div className="menu-list appetizer-list">
          <h3>Appetizers</h3>
          {ListApps.map(item => (
            <div key={`appetizer-${item.menuID}`} className="menu-item">
              <img src={getImageForItem(item.menuName)} alt={item.menuName} className="menu-item-image" />
              <div className="menu-item-name">{item.menuName}</div>
            </div>
          ))}
        </div>
        {/* <div className="menu-list a-la-carte-list">
          <h3>A La Carte</h3>
          {ALaCarteItems.map(item => (
            <div key={`alc-${item.id}`} className="menu-item">
              <img src={pandaLogo} alt={item.name} className="menu-item-image" />
              <div className="menu-item-name">{item.name}</div>
              <div className="menu-item-price">${item.price?.toFixed(2) || ''}</div>

            </div>
          ))}
        </div> */}
        <div className="menu-list beverage-list">
          <h3>Beverages</h3>
          {ListDrinks.map(item => (
            <div key={`bev-${item.menuID}`} className="menu-item">
              <img src={getImageForItem(item.menuName)} alt={item.menuName} className="menu-item-image" />
              <div className="menu-item-name">{item.menuName}</div>
              {/*<div className="menu-item-price">${item.price?.toFixed(2) || ''}</div>*/}

            </div>
          ))}
        </div>
      </div>
  <button className = "sign-out-button" onClick={() => setShowSignOutModal(true)}>Sign Out</button>
    </div>
  );
}