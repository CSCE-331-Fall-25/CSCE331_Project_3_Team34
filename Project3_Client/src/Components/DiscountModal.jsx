import React, { useState } from "react";

export default function DiscountModal({ show, onClose, onApplied, user, isManager }) {
  if (!show) return null;

  const [discountCode, setDiscountCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/add-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Include cookies with this request
        body: JSON.stringify({ discountCode }),
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
        <div className="modal-error">{errorMessage}</div>
        <div className="modal-actions">
          <button onClick={handleSubmit} className="modal-submit" disabled={loading}>
            {loading ? "Applying..." : "Submit"}
          </button>
          <button onClick={() => typeof onClose === "function" && onClose()} className="modal-back" disabled={loading}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
