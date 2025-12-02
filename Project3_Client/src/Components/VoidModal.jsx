import React, { useState } from "react";

export default function VoidModal({ show, onClose, userIsManager }) {
    if (!show) return null;

    const [transactionId, setTransactionId] = useState('');
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const voidTransaction = async () => {
        console.log("we going right");
        try {
        const res = await fetch("/api/void-transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactionId, userIsManager }),
        });
        const data = await res.json();
        console.log(data);
        switch (data.error) {
          case 0:
            setErrorMessage("Must be a manager to void orders")
            break;
          case 1:
            setErrorMessage("Transaction not found");
            break;
          case 55:
            setErrorMessage("Transaction " + transactionId + " voided");
            break;
        }
        } catch (err) {
            console.error("Error removing transaction:", err);
            setErrorMessage("Failed to remove transaction");
        }
    }

    return (
    <div className="modal-overlay" onClick={() => typeof onClose === "function" && onClose()}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Enter Transaction ID</h2>
        <div className="modal-error">{errorMessage}</div>
          <div className="discount-manager-section">
            <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="number"
                className="modal-input"
                value={transactionId ?? ''}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. 33500"
                disabled={loading}
              />
            </div>
          </div>
        <div className="modal-actions">
          <button onClick={() => voidTransaction()} className="modal-back" disabled={loading}>
            Void
          </button>
          <button onClick={() => typeof onClose === "function" && onClose()} className="modal-back" disabled={loading}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}