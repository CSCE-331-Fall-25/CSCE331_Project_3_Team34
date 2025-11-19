import React, { use, useEffect, useState } from 'react';
import "../styles/Menu/Menu.css";
import pandaLogo from '../assets/PandaLogo.svg';

import { getImageForItem } from "../assets/utils/imageMapper";



import { useNavigate } from 'react-router-dom';
//component imports
import SignOutButton from '../Components/SignOut.jsx';
export default function Menu() {

  const pageSizes = {
    entrees: 16,
    sides: 4,
    apps: 4,
    drinks: 8,
  };

  const cycleInterval = 5000; // 5 seconds

  const [extraMenus, setExtraMenus] = useState([]);
  const [displayed, setDisplayed] = useState({
    entrees: [],
    sides: [],
    apps: [],
    drinks: [],
  });

  const [pages, setPages] = useState({
    entrees: 0,
    sides: 0,
    apps: 0,
    drinks: 0,
  });

  // Router navigation for sign out
   const navigate = useNavigate();
   const handleSignOut = () => navigate('/');
   // modal to confirm sign out
   const [showSignOutModal, setShowSignOutModal] = useState(false);
   //const [extraMenus, setExtraMenus] = useState([]);
   const [allItems, setAllItems] = useState([]);

  
  const ListEntrees = [];
  const ListSides = [];
  const ListApps = [];
  const ListDrinks = [];
  
  
  const item_list = [];
  const itemRowSize = 8;

  useEffect(() => {
    const fetchMenusByType = async (type) => {
      try {
        const response = await fetch("/api/fetch-menus-by-type", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        });
        const data = await response.json();
        return response.ok ? data : [];
      } catch (err) {
        console.error(err);
        return [];
      }
    };

    (async () => {
      const fetchedEntrees = await fetchMenusByType("entree");
      const fetchedSides = await fetchMenusByType("side");
      const fetchedApps = await fetchMenusByType("appetizer");
      const fetchedDrinks = await fetchMenusByType("drink");

      const allMenus = [
        ...(fetchedEntrees || []),
        ...(fetchedSides || []),
        ...(fetchedApps || []),
        ...(fetchedDrinks || [])
      ];

      setExtraMenus(allMenus);
    })();
  }, []);

  const typeLists = {
    entrees: extraMenus.filter(i => i.type.toLowerCase() === 'entree'),
    sides: extraMenus.filter(i => i.type.toLowerCase() === 'side'),
    apps: extraMenus.filter(i => i.type.toLowerCase() === 'appetizer' || i.type.toLowerCase() === 'app'),
    drinks: extraMenus.filter(i => i.type.toLowerCase() === 'drink'),
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newDisplayed = {};
      const newPages = {};
      Object.keys(typeLists).forEach(type => {
        const list = typeLists[type];
        const pageSize = pageSizes[type];
        const nextPage = (pages[type] + 1) % Math.ceil(list.length / pageSize);
        const start = nextPage * pageSize;
        const end = start + pageSize;
        newDisplayed[type] = list.slice(start, end);
        newPages[type] = nextPage;
      });
      setDisplayed(newDisplayed);
      setPages(newPages);
    }, cycleInterval);

    return () => clearInterval(interval);
  }, [extraMenus, pages]);

  useEffect(() => {
    const initDisplayed = {};
    Object.keys(typeLists).forEach(type => {
      initDisplayed[type] = typeLists[type].slice(0, pageSizes[type]);
    });
    setDisplayed(initDisplayed);
  }, [extraMenus]);

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
      const fetchedItems = await fetchAllItems();
      if (!mounted) return;
      setAllItems(fetchedItems || []);
    })();
    return () => { mounted = false; };
  }, []);

  const ListItems = allItems;

  
  

  return (
    <div className="mainBackground">
      {/* <div className="header-container">
       <div className="side left-text">Panda Express</div>

      <div className="center-logo">
        <img src={pandaLogo} alt="Panda Logo" className="logo" />
      </div>

      <div className="side right-text">Menu</div> 
    </div>*/}
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
                {displayed.entrees.map(item => (
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
                {displayed.sides.map(item => (
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
                {displayed.apps.map(item => (
                  <div key={`app-${item.menuID}`} className="menu-item">
                    <img src={getImageForItem(item.menuName)} alt={item.menuName} className="menu-item-image" />
                    <div className="menu-item-name">{item.menuName}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* APPETIZERS */}
            <div className="menu-section">
              <h3 className="section-title">Drinks</h3>

              <div className="section-grid">
                {displayed.drinks.map(item => (
                  <div key={`bev-${item.menuID}`} className="menu-item">
                    <img src={getImageForItem(item.menuName)} alt={item.menuName} className="menu-item-image" />
                    <div className="menu-item-name">{item.menuName}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
          <br></br>
    <button className = "sign-out-button" onClick={() => setShowSignOutModal(true)}>Sign Out</button>
      </div>
    </div>
  );
}