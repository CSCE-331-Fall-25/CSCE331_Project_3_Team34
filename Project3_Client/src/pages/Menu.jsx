import React, { useState } from 'react';
import "../styles/Menu/Menu.css";
import pandaLogo from '../assets/PandaLogo.svg';
import { useNavigate } from 'react-router-dom';

export default function Menu() {
  // Router navigation for sign out
   const navigate = useNavigate();
   const handleSignOut = () => navigate('/');
   // modal to confirm sign out
   const [showSignOutModal, setShowSignOutModal] = useState(false);
  
  const ListItems = [
    // Placeholder for menu items
    { id: 1, name: "Bowl", type: "Item", image: pandaLogo, price: 5.00 },
    { id: 2, name: "Plate", type: "Item", image: pandaLogo, price: 7.00 },
    { id: 3, name: "Kid's Meal", type: "Item", image: pandaLogo, price: 4.50 },

  ];
  const ListEntrees = [
    // Placeholder for menu items
    { id: 1, name: "Orange Chicken", type: "Entree", image: pandaLogo },
    { id: 2, name: "Beef Broccoli", type: "Entree", image: pandaLogo },
    { id: 3, name: "Kung Pao Chicken", type: "Entree", image: pandaLogo },

  ];
  const SideItems = [
    // Placeholder for side items
    { id: 1, name: "Fried Rice", type: "Side", image: pandaLogo },
    { id: 2, name: "Chow Mein", type: "Side", image: pandaLogo },

  ];
  const ALaCarteItems = [
    // Placeholder for a la carte items
    { id: 1, name: "Egg Roll", type: "A La Carte", image: pandaLogo, price: 2.00 },

  ];
  const BeverageItems = [
    // Placeholder for beverage items
    { id: 1, name: "Soda", type: "Beverage", image: pandaLogo, price: 1.50 },
  ];

  return (
    <div className="menu-page-container">
       {showSignOutModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowSignOutModal(false)}
            >
          <div className="modal-window" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              <h2>Confirm Sign Out</h2>
            <div>
              Are you sure you want to sign out?
            </div>
            </div>
            <div className= "modal-actions">
              <button className="button" onClick={handleSignOut}>Yes</button>
              <button className="button" onClick={() => setShowSignOutModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
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
            <div key={`entree-${item.id}`} className="menu-item">
              <img src={item.image || pandaLogo} alt={item.name} className="menu-item-image" />
              <div className="menu-item-name">{item.name}</div>
            </div>
          ))}
        </div>
        <div className="menu-list side-list">
          <h3>Sides</h3>
          {SideItems.map(item => (
            <div key={`side-${item.id}`} className="menu-item">
              <img src={item.image || pandaLogo} alt={item.name} className="menu-item-image" />
              <div className="menu-item-name">{item.name}</div>
            </div>
          ))}
        </div>
        <div className="menu-list a-la-carte-list">
          <h3>A La Carte</h3>
          {ALaCarteItems.map(item => (
            <div key={`alc-${item.id}`} className="menu-item">
              <img src={pandaLogo} alt={item.name} className="menu-item-image" />
              <div className="menu-item-name">{item.name}</div>
              <div className="menu-item-price">${item.price?.toFixed(2) || ''}</div>

            </div>
          ))}
        </div>
        <div className="menu-list beverage-list">
          <h3>Beverages</h3>
          {BeverageItems.map(item => (
            <div key={`bev-${item.id}`} className="menu-item">
              <img src={pandaLogo} alt={item.name} className="menu-item-image" />
              <div className="menu-item-name">{item.name}</div>
              <div className="menu-item-price">${item.price?.toFixed(2) || ''}</div>

            </div>
          ))}
        </div>
      </div>
  <button className = "sign-out-button" onClick={() => setShowSignOutModal(true)}>Sign Out</button>
    </div>
  );
}