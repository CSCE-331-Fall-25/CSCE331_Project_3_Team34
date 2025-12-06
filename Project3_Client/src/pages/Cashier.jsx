import React from "react";
import "../styles/Cashier/Cashier.css";
import "../styles/Cashier/DiscountModal.css";
import { useEffect, useState, useRef } from "react";

// don't import server code into the client bundle
// replace server-side debugging checks with a local flag
const debugging = false;
import { useNavigate, useSearchParams } from 'react-router-dom';

//components
import SignOutButton from "../Components/SignOut.jsx";
import DiscountModal from "../Components/DiscountModal.jsx";
import CashierCostTable from "../Components/CashierCostTable.jsx";
import ClearTransactionButton from "../Components/ClearTransactionButton.jsx";
import RemoveItemButton from "../Components/RemoveItemButton.jsx";
import PurchaseButton from "../Components/PurchaseButton.jsx";
import BuyItemButton from "../Components/BuyItemButton.jsx";
import VoidModal from "../Components/VoidModal.jsx";
import CreateMealModal from "../Components/CreateMealModal.jsx";
import SizeModal from "../Components/SizeModal.jsx";
import { saveOrder, loadOrder, clearOrder } from '../utils/orderPersistence';
export default function Cashier() {
  const navigate = useNavigate();
  //newest Row reference for auto scrolling
  const lastRowRef = useRef(null);
  //handles selected row of items (used for removal/customization)
  const [selectedRow, setSelectedRow] = useState(null);

  //modal to confirm sign out
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showCreateMeal, setShowCreateMealModal] = useState(false);
  // modal mode handled in CreateMealModal

  // Discount buttons/state
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPriceOff, setDiscountPriceOff] = useState(0);

  //sizeModal
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  // pending callback for child components to receive the chosen size
  const [pendingSizeCallback, setPendingSizeCallback] = useState(null);
  const sizeOptions = ["Small", "Medium", "Large"]; //UPDATE BASED ON WHAT SIZES WE HAVE

  //updates for orderTable
  const [currCost, setCurrCost] = useState(0);
  const [tax, setTax] = useState(0);
  const [priceTotal, setPriceTotal] = useState(0);
  const [transactionItems, setTransactionItems] = useState([]);
  const [itemType, setItemType] = useState("NULL");
  // modal-specific state moved to CreateMealModal

  //Void modal
  const [showVoidModal, setShowVoidModal] = useState(false);

  //ManagerOverrideLogin
   const [searchParams] = useSearchParams();
   const sucessfulOverrideLogin = searchParams.get('success');
    const [tempManager, setTempManager] = useState(false);



    useEffect(() => {
      window.history.replaceState({}, '', window.location.pathname);

      // Always update page state when returning from login, regardless of success/failure
      if (sucessfulOverrideLogin) {
        UpdatePage();
      }

      if (sucessfulOverrideLogin == 2) {
        fetchUserData().then((data) => {
          if (data && data.success) {
            console.log("Fetched user data before Manager Override Login");
            console.log("Attempting Manager Override Login as " + (data.user || null));
            if(data.isManager){
              setTempManager(true);
              console.log("Manager Override Login Successful");
              setShowDiscountModal(true);
            }
            else{
              alert('Manager Override Login Failed: Not a Manager');
            }
          }
        });
      }
      console.log('sucessfulOverrideLogin param:', sucessfulOverrideLogin);
    }, [sucessfulOverrideLogin]);

  const handleBuildItem = (e) => {
    const id = e.target.id;
    setItemType(id);
    // Let CreateMealModal handle its own internal state and UI
    setShowCreateMealModal(true);
  };
  
  const openDrinkModal = () => { setItemType("Drink"); setShowCreateMealModal(true); };
  const openAlacarteModal = () => { setItemType("A La Carte"); setShowCreateMealModal(true); };
  
  //login features
  const [User, setUser] = useState(null);
  const [isManager, setisManager] = useState(false);
  function fetchUserData() {
    // console.log("Fetching user data...");
    return fetch('/api/get-user', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user || null);
          setisManager(data.isManager || false);
          console.log("Fetched user data:", data.user, "Is Manager:", data.isManager);
          return data;
        }
      });
  }

  // Note: buy/clear/remove/purchase actions are implemented in their own components

  // Navigate back to the top-level login page (App shows login UI when pathname === '/')
  const handleSignOut = () => navigate('/');
  const handleReset = () => {
    // simply close the create meal modal; CreateMealModal owns its state
    setShowCreateMealModal(false);
  }

  const handleShowVoid = () => setShowVoidModal(true);
  const handleAddDiscount = () => setShowDiscountModal(true);
  const handleCreateMeal = () => setShowCreateMealModal(true);

 

  //TODO: Make update based on INPUT from CUSTOMIZATION MODAL
  const handleCustomizeOrder = () => {
  if (debugging) console.log("Customize order clicked");
    // Implement customization logic here
    fetch("/api/customize-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include', // Include cookies with this request
      body: JSON.stringify({ index: selectedRow }) // Pass the index in the body
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("Order customized");
          setSelectedRow(null);
          fetchUserData();
          UpdatePage();
        }
      });
  }
  
  

  //Called on page refresh, should update frontend based on what is on the server
  useEffect(() => {
    
    console.log("Fetching current state from server...");
    // Guard against double runs in development caused by React.StrictMode (React 18 double-mount)
    // and by HMR remounts. Use a window-scoped flag so the fetch only happens once per page load.
    try {
      if (typeof window !== 'undefined') {
        if (window.__cashier_initial_fetch_done) return;
        window.__cashier_initial_fetch_done = true;
      }
    } catch (e) {
      // ignore any access errors and continue
    }

    // Load saved order first
    const savedOrder = loadOrder('cashier');
    if (savedOrder.length > 0) {
      setTransactionItems(savedOrder);
    }

    UpdatePage();
  }, []);
  

  // Scroll to the latest added item whenever transactionItems change
  useEffect(() => {
    if (lastRowRef.current) {
      lastRowRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transactionItems]);

  const UpdatePage = () => {
  fetch("/api/current-state", {
    credentials: 'include' // Include cookies with this request
  })
      .then((res) => res.json())
      .then((data) => {
        //Formats orders into a flat array for display
        // console.log("Update Page Current State Data:", data);
        if (Array.isArray(data.orders)) {
          const formattedItems = data.orders.flatMap(order => [
            { cost: order.cost, item: order.item, type: "main"},
            ...(order.entrees ? order.entrees.map(entree => ({ item: (typeof entree === 'string' ? { name: entree } : entree), type: "entree" })) : []),
            ...(order.sides ? order.sides.map(side => ({ item: (typeof side === 'string' ? { name: side } : side), type: "side" })) : [])
          ]);
          // console.log("UpdatePage Formatted:", formattedItems);
          //updates the front end to show current items
          setTransactionItems(formattedItems);
          saveOrder(formattedItems, 'cashier');
        } else {
          setTransactionItems([]);
          saveOrder([], 'cashier');
        }
        //Calls functions to update their states
        setCurrCost(data.currCost || 0);
        setPriceTotal(data.totalPrice || 0);
        setTax(data.tax || 0);
        setDiscountAmount(data.discountAmount || 0);
        setDiscountPriceOff(data.priceOff || 0);
      });
      fetchUserData();
  }
  function handlePurchase() {
    //reset temp manager on purchase

    // After purchase, refresh the page state
    UpdatePage();
    //logout if was temp manager
    if(tempManager){
      navigate('/login?returnTo=/cashier');
    }
    //move to login page

    setTempManager(false);

  }




  return (
    <div className="main-page bkgColor cashier-container">
      {/* //to use the size modal, set sizes based on options, then collect setSelectedSize for output */}
      {showSizeModal && (
        <SizeModal
          // pass a function so we don't call the setter during render
          onClose={() => {
            setShowSizeModal(false);
            setPendingSizeCallback(null);
          }}
          onSelectSize={(size) => {
            setSelectedSize(size);
            setShowSizeModal(false);
            if (typeof pendingSizeCallback === 'function') {
              try { pendingSizeCallback(size); } catch (e) { console.error(e); }
              setPendingSizeCallback(null);
            }
          }}
          sizes={sizeOptions}
        />
      )}

      <CreateMealModal
        show={showCreateMeal}
        onClose={handleReset}
        initialType={itemType}
        onBought={() => { UpdatePage(); }}
        // allow the modal to request a size selection; the modal provides a callback to receive the selected size
        requestSizeSelection={(receiveSizeCallback) => {
          if (typeof receiveSizeCallback === 'function') {
            setPendingSizeCallback(() => receiveSizeCallback);
            setShowSizeModal(true);
          }
        }}
        selectedSize={selectedSize}
      />
      <DiscountModal
        show={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        onApplied={({ discountAmount: amt, priceOff: off, discountPer }) => {
          // update local discount view and refresh state from server
          setShowDiscountModal(false);
          setDiscountAmount(amt || 0);
          setDiscountPriceOff(off || 0);
          UpdatePage();
        }}
        userIsManager={isManager || tempManager}
      />
      {showSignOutModal && (
        <SignOutButton onClose={() => setShowSignOutModal(false)} />
      )}
      <VoidModal
        show={showVoidModal}
        onClose={() => setShowVoidModal(false)}
        userIsManager={isManager}
      />
      {/* Sidebar */}
      <div className="sidebar-left" />

      {/* Header bar */}
      <div className="header-bar" style={{zIndex:-1}} />

      {/* Labels */}
      <div className="label-employee">Employee:</div>
      <div className="label-time">Time:</div>

      {/* Order summary area (moved to CashierCostTable for clarity) */}
      <div className="order-area">
        <CashierCostTable
          transactionItems={transactionItems}
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
          lastRowRef={lastRowRef}
          currCost={currCost}
          tax={tax}
          priceTotal={priceTotal}
          discountAmount={discountAmount}
          discountPriceOff={discountPriceOff}
          onPurchase={handlePurchase}
        />
      </div>

      {/* Menu buttons */}
      <div className="menu-area">
        <div className="menu-row">
          {["Bowl", "Plate", "Bigger", "Family"].map((item) => (
            <button key={item} id={item} className="buy-button" onClick={handleBuildItem}>
              {item}
            </button>
          ))}
        </div>
        <div className="menu-row spaced">
          {["A La Carte", "Appetizer", "Drink", "Bottle"  ].map((item) => (
            <button key={item} id={item} className="buy-button" onClick={handleBuildItem}>
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* update order buttons (extracted components) */}
      <div className="updateOrder-button-row">
        <RemoveItemButton index={selectedRow} onRemoved={() => { setSelectedRow(null); UpdatePage(); }} />
        <ClearTransactionButton onCleared={() => { UpdatePage(); }} />
        <button onClick={handleCustomizeOrder} className="UpdateOrderButton">CUSTOMIZE</button>
      </div>

      {/* Purchase handled inside CashierCostTable to preserve original layout */}

      {/* Function buttons (left sidebar) */}
      <div className="functions-column">
        {[
          { text: "Discount", handler: handleAddDiscount },
          { text: "Void", handler: handleShowVoid },
          { text: "Sign Out", handler: () => setShowSignOutModal(true) },
        ].map((btn) => (
          <button key={btn.text} onClick={btn.handler} className="function-button">
            {btn.text}
          </button>
        ))}
      </div>
    </div>
  );
}