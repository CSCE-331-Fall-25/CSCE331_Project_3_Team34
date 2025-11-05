import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Manager/Manager.css";

export default function Manager() {

  //Reports
  const [showReportModal, setShowReportModal] = useState(false);
  const employeeName = "Name"; // This should be fetched from backend or context

  // Managment modal
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [managmentType, setManagmentType] = useState("");
  const [inputContent, setInputContent] = useState("Test");

  // Router navigation
  const navigate = useNavigate();

  // Navigate back to the top-level login page (App shows login UI when pathname === '/')
  const handleSignOut = () => navigate('/');

  //modal to confirm sign out
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  return (
    <div className = "manager-page-container">
      {showReportModal &&(
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Reports</h2>
              <div className= "report-buttons-container">
                {/* Set up reports based on reports.jsx implemetation */}
                <button className="button">X-Report</button>
                <button className="button">Z-Report</button>
                <button className="button">Product Usage Chart</button>
                <button className="button">Restock Report</button>
                <button className="button">Sales Report</button>
                <button className="button" onClick={() => setShowReportModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )
      }
      {/* This is for all update stuff EX: adding/removing an item from menu, inventory, employee management
      I want it to be stored in a selectable table that can be clicked on to edit/remove entries
      For adding I want either 1 of 2 things, a text area to add an entry OR click add, opens a small modal with the text fields to be filled */}
      {showManagementModal &&(
          <div className="modal-overlay">
            <div className="modal-content">
              {/* managmentType defines what screen to open and what is going to be updated, use this variable to change funtionality on react */}
              <h2>{managmentType} Management</h2>
              <div className="input-container">
                <input
                  type="text"
                  value={inputContent}
                  onChange={e => setInputContent(e.target.value)}
                  aria-label={`${managmentType} input`}
                />
              </div>
              <div className= "report-buttons-container">
                <button className="button">Add </button>
                <button className="button">Remove </button>
                <button className="button">Update </button>
                <button className="button" onClick={() => setShowManagementModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )
      }
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
      <div className = "manager-subheader"><h1>Welcome, {employeeName}!</h1></div>

      <div className = "manager-buttons-container">
        <button className = "button manager-button" onClick={() => setShowReportModal(true)}>View Reports</button>
        <button className = "button manager-button" onClick={()=> {
            setManagmentType("Inventory");
            setShowManagementModal(true);}
          }
        >
          Manage Inventory
        </button>
        <button className = "button manager-button"onClick={()=> {
            setManagmentType("Employee");
            setShowManagementModal(true);}
          }
        >
          Employee Management
        </button>
        <button className = "button manager-button"onClick={()=> {
            setManagmentType("Menu");
            setShowManagementModal(true);}
          }
        >
          Menu Management
        </button>
        {/* Can be used for accessability settings in the future */}
        <button className = "button manager-button">Settings</button>
  <button className = "button manager-button" onClick={() => setShowSignOutModal(true)}>Sign Out</button>
      </div>
      
    </div>
  );
}