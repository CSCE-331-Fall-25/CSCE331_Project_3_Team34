import React, { useState } from "react";

export default function PurchaseButton({ onPurchased }) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/purchase", { 
        method: "POST",
        credentials: 'include' // Include cookies with this request
      });
      const data = await res.json();
      if (data && data.success) {
        console.log("Purchase successful");
        if (typeof onPurchased === "function") onPurchased(data);
      } else {
        console.error("Purchase failed", data);
      }
    } catch (err) {
      console.error("Error during purchase:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePurchase} className="miscButtonFlex purchase-button" disabled={loading}>
      {loading ? "Processing..." : "Purchase"}
    </button>
  );
}
