import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DiscountModal({ show, onClose, onApplied, userIsManager: initialUserIsManager }) {
  if (!show) return null;

  const navigate = useNavigate();
  const [discountCode, setDiscountCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  // Manager manual inputs
  const [managerPriceOff, setManagerPriceOff] = useState("");
  const [managerDiscountOff, setManagerDiscountOff] = useState("");
  // Local state for userIsManager, initialized from prop
  const [userIsManager, setUserIsManager] = useState(initialUserIsManager);

  // Sync local state with prop changes
  useEffect(() => {
    setUserIsManager(initialUserIsManager);
  }, [initialUserIsManager]);

  useEffect(() => {
      console.log("userIsManager changed: " + userIsManager);
      // Reset form when userIsManager changes
      setDiscountCode("");
      setErrorMessage("");
      setManagerPriceOff("");
      setManagerDiscountOff("");
    }, [userIsManager]);


  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/add-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Include cookies with this request
        body: JSON.stringify({ discountCode, priceOff: managerPriceOff, discountPer: managerDiscountOff }),
      });
      const data = await res.json();
      if (data && data.acceptedDiscount === 1) {
        if (typeof onApplied === "function") {
          onApplied({
            discountAmount: data.discountAmount || 0,
            priceOff: data.priceOff || 0,
            discountPer: data.discountPer || 0,
          });
        }
        if (typeof onClose === "function") onClose();
      } else if (data && data.acceptedDiscount === -1) {
        setErrorMessage("Cannot apply discount before adding items");
      } else {
        setErrorMessage("Invalid discount code");
      }
    } catch (err) {
      console.error("Error applying discount:", err);
      setErrorMessage("Failed to apply discount");
    } finally {
      setLoading(false);
    }
  };
  
  function OpenLoginPage() {
    //sessionStorage.setItem('loginReturnTo', '/cashier');
    navigate('/login?returnTo=/cashier');
    // setUserIsManager(true);
  }

  return (
    <div className="modal-overlay" onClick={() => typeof onClose === "function" && onClose()}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Enter Discount Code</h2>
        <input
          type="text"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          placeholder="Discount Code"
          className="modal-input"
          disabled={loading}
        />
        {/* If the user is a manager, show manual inputs for price off and discount off */}
        {userIsManager && (
          <div className="discount-manager-section">
            <h3 style={{ margin: '8px 0' }}>Manager Manual Adjustments</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ fontWeight: 700 }}>Price Off ($):</label>
              <input
                type="number"
                step="0.01"
                className="modal-input"
                value={managerPriceOff ?? ''}
                onChange={(e) => setManagerPriceOff(e.target.value)}
                placeholder="e.g. 1.50"
                disabled={loading}
              />
              <label style={{ fontWeight: 700 }}>Discount Off (%):</label>
              <input
                type="number"
                step="0.01"
                className="modal-input"
                value={managerDiscountOff ?? ''}
                onChange={(e) => setManagerDiscountOff(e.target.value)}
                placeholder="e.g. 10"
                disabled={loading}
              />
            </div>
          </div>
        )}
        <div className="modal-error">{errorMessage}</div>
        <div className="modal-actions">
          <button onClick={handleSubmit} className="modal-submit" disabled={loading}>
            {loading ? "Applying..." : "Submit"}
          </button>
          <button onClick={() => typeof onClose === "function" && onClose()} className="modal-back" disabled={loading}>
            Back
          </button>
          {!userIsManager && (<button onClick={() => OpenLoginPage()} className="modal-back" disabled={loading}>
            Manager Override
          </button>)}
        </div>
      </div>
    </div>
  );
}

DiscountModal.displayName = 'DiscountModal';
