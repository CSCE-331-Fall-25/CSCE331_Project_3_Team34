import React, { useState } from "react";

export default function RemoveItemButton({ index, onRemoved }) {
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (loading) return;
    if (index === null || index === undefined) {
      console.warn("No index selected to remove");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/remove-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Include cookies with this request
        body: JSON.stringify({ index }),
      });
      const data = await res.json();
      if (data && data.success) {
        console.log("Item removed at index", index);
        if (typeof onRemoved === "function") onRemoved(data);
      } else {
        console.error("Failed to remove item", data);
      }
    } catch (err) {
      console.error("Error removing item:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleRemove} className="UpdateOrderButton" disabled={loading || index === null || index === undefined}>
      {loading ? "Removing..." : "REMOVE"}
    </button>
  );
}
