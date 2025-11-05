import React from 'react';
import { useState } from 'react';
import "../styles/Manager/Manager.css";

export default function Manager() {

  //Reports
  const [showReportModal, setShowReportModal] = useState(false);
  const employeeName = "Name"; // This should be fetched from backend or context

  // Managment modal
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [managmentType, setManagmentType] = useState("");
  return (
    <div className = "manager-page-container">
      {showReportModal &&(
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Reports</h2>
              <div className= "report-buttons-container">
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
      {showManagementModal &&(
          <div className="modal-overlay">
            <div className="modal-content">
              
              <h2>Inventory Management</h2>
              <div className= "report-buttons-container">
                <button className="button" onClick={() => setShowManagementModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )
      }
      <div className = "manager-subheader"><h1>Welcome, {employeeName}!</h1></div>

      <div className = "manager-buttons-container">
        <button className = "button manager-button" onClick={() => setShowReportModal(true)}>View Reports</button>
        <button className = "button manager-button" onClick={()=> {
            setManagmentType("Inv");
            setShowManagementModal(true);}
          }
        >
          Manage Inventory
        </button>
        <button className = "button manager-button">Employee Management</button>
        <button className = "button manager-button">Settings</button>
      </div>
      
    </div>
  );
}