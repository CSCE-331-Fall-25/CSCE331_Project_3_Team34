import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BackToHubButton.css'; // We'll create this CSS file next

export default function BackToHubButton({ className = "back-to-hub-button" }) {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleConfirm = () => {
    setShowModal(false);
    navigate('/hub');
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <>
      <button className={className} onClick={() => setShowModal(true)}>
        Back to Hub
      </button>

      {showModal && (
        <div className="back-to-hub-modal-overlay">
          <div className="back-to-hub-modal-content">
            <h2>Return to Hub?</h2>
            <p>Are you sure you want to leave this page and return to the Hub?</p>
            <div className="back-to-hub-modal-actions">
              <button className="back-to-hub-cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button className="back-to-hub-confirm-btn" onClick={handleConfirm}>
                Yes, Return to Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
