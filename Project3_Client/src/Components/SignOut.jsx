import React from "react";
import { useNavigate } from "react-router-dom";

export default function SignOutButton({ onClose } = {}) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // navigate back to top-level login
    navigate("/");
    if (typeof onClose === "function") onClose();
  };

  const handleClose = () => {
    if (typeof onClose === "function") onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">
          <h2>Confirm Sign Out</h2>
          <div>Are you sure you want to sign out?</div>
        </div>
        <div className="modal-actions">
          <button className="button" onClick={handleSignOut}>
            Yes
          </button>
          <button className="button" onClick={handleClose}>
            No
          </button>
        </div>
      </div>
    </div>
  );
}
