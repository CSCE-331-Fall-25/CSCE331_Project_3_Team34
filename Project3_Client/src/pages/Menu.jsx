import React, { use, useEffect, useMemo, useState } from 'react';
import "../styles/Menu/Menu.css";
import pandaLogo from '../assets/PandaLogo.svg';

import { getImageForItem } from "../assets/utils/imageMapper";



import { useNavigate } from 'react-router-dom';
//component imports
import SignOutButton from '../Components/SignOut.jsx';
export default function Menu() {

  const pageSizes = {
    items: 6,
    entrees: 8,
    sides: 4,
    apps: 4,
    drinks: 8,
  };

  const cycleInterval = 3000; // 5 seconds

  const [HeaderOn, setHeaderOn] = useState(false);

  const [extraMenus, setExtraMenus] = useState([]);
  const [displayed, setDisplayed] = useState({
    items: [],
    entrees: [],
    sides: [],
    apps: [],
    drinks: [],
  });

  const [pages, setPages] = useState({
    items: 0,
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


  const cycleSlice = (list, start, pageSize) => {
    if (list.length <= pageSize) return list; // Not enough to paginate

    let result = [];
    for (let i = 0; i < pageSize; i++) {
      const index = (start + i) % list.length;
      result.push(list[index]);
    }
    return result;
  };



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
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
      return [];
    }
    };

    (async () => {
        const fetchedEntrees = await fetchMenusByType("entree");
        const fetchedSides = await fetchMenusByType("side");
        const fetchedApps = await fetchMenusByType("appetizer");
        const fetchedDrinks = await fetchMenusByType("drink");

        const fetchedItems = await fetchAllItems();

        const allMenus = [
          ...(fetchedEntrees || []),
          ...(fetchedSides || []),
          ...(fetchedApps || []),
          ...(fetchedDrinks || [])
        ];

        setExtraMenus(allMenus);
        setAllItems(fetchedItems || []);
      })();
  }, []);

  const typeLists = useMemo(() => ({
    items: allItems,
    entrees: extraMenus.filter(i => i.type.toLowerCase() === 'entree'),
    sides: extraMenus.filter(i => i.type.toLowerCase() === 'side'),
    apps: extraMenus.filter(i => i.type.toLowerCase() === 'appetizer' || i.type.toLowerCase() === 'app'),
    drinks: extraMenus.filter(i => i.type.toLowerCase() === 'drink'),
  }), [allItems, extraMenus]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newDisplayed = {};
      const newPages = {};
      Object.keys(typeLists).forEach(type => {
        const list = typeLists[type];
        const pageSize = pageSizes[type];
        const nextPage = (pages[type] + 1) % Math.ceil(list.length / pageSize);

        const start = nextPage * pageSize;

        newDisplayed[type] = cycleSlice(list, start, pageSize);

        newPages[type] = nextPage;
      });
      setDisplayed(newDisplayed);
      setPages(newPages);
    }, cycleInterval);

    return () => clearInterval(interval);
  }, [pages, allItems, extraMenus]);

  useEffect(() => {
    const initDisplayed = {};
    Object.keys(typeLists).forEach(type => {
      const list = typeLists[type];
      initDisplayed[type] = cycleSlice(list, 0, pageSizes[type]);
    });
    setDisplayed(initDisplayed);
  }, [typeLists]);

  

  return (
    <div className="mainBackground">
      <div className="menu-page-container">
        {HeaderOn && (
          <header className="header-container">

            <div className="center-logo">
              <img src={pandaLogo} alt="Panda Logo" className="logo" />
            </div>
          </header>
        )}
        <main className="menu-page-container">
          {showSignOutModal && <SignOutButton />}
          <div className="menu-content">

            {/* COLUMN 1 – MENU ITEMS */}
            <div className="column">
              <div className="menu-section">
                <h3 className="section-title">Menu Items</h3>

                <div className="section-grid">
                  {displayed.items.map(item => {
                  const imgSrc = getImageForItem(item.itemName);
                  let boxStyle = imgSrc ? 'menu-item menu-item-menu' : 'menu-item menu-item-menu no-img';

                  return (
                    <div key={item.itemID} className={boxStyle}>
                      {imgSrc && (
                        <img
                          src={imgSrc}
                          alt={item.itemName}
                          className="menu-item-image"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <div className="menu-item-name">{item.itemName}</div>
                      <div className="menu-item-price">
                        ${item.itemPrice?.toFixed(2) || ""}
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </div>

            {/* COLUMN 2 – ENTREES */}
            <div className="column">

              {/* ENTREES */}
              <div className="menu-section">
                <h3 className="section-title">Entrees</h3>

                <div className="section-grid">
                  {displayed.entrees.map(item => {
                    const imgSrc = getImageForItem(item.menuName);
                    let boxStyle = imgSrc ? 'menu-item' : 'menu-item no-img';

                    return (
                    <div key={`entree-${item.menuID}`} className={boxStyle}>
                      {imgSrc && (<img src={getImageForItem(item.menuName)} alt={item.menuName} className="menu-item-image" />)}
                      
                      <div className="menu-item-name">{item.menuName}</div>
                      {item.priceMod > 0 && (
                        <img src={getImageForItem("P")} alt="Premium" className="menu-item-image-premium" />
                      )}
                    </div>
                  );
                  })}
                </div>
              </div>

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

            </div>

            {/* COLUMN 3 – SIDES + APPETIZERS */}
            <div className="column">

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
                  {displayed.drinks.map(item => { 
                    const imgSrc = getImageForItem(item.menuName);
                    let boxStyle = imgSrc ? 'menu-item' : 'menu-item no-img';

                    return (
                    <div key={`bev-${item.menuID}`} className={boxStyle}>
                      {imgSrc && (
                        <img src={getImageForItem(item.menuName)} alt={item.menuName} className="menu-item-image" />
                      )}
                      <div className="menu-item-name">{item.menuName}</div>
                    </div>
                  );
                })}
                </div>
              </div>

            </div>
          </div>
            <br></br>
        {HeaderOn && (<button className = "sign-out-button" onClick={() => setShowSignOutModal(true)}>Sign Out</button>)}
        </main>
      </div>
    </div>
  );
}