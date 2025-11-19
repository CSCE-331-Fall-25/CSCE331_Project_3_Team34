import React, { useState } from "react";

export default function BuyItemButton({ itemId, children, onBought, size = null }) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/buy-item", {
        method: "POST",
        credentials: 'include', // Include cookies with this request
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemID: itemId , size: size }),
      });
      const data = await res.json();
      if (data && data.success) {
        console.log("Item bought:", itemId);
        if (typeof onBought === "function") onBought(data);
      } else {
        console.error("Failed to buy item:", itemId, data);
      }
    } catch (err) {
      console.error("Error buying item:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="buy-button" onClick={handleBuy} disabled={loading} id={itemId}>
      {loading ? "Adding..." : children || itemId}
    </button>
  );
}
