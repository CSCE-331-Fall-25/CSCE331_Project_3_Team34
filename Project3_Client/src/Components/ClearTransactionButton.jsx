import React, { useState } from "react";

export default function ClearTransactionButton({ onCleared }) {
  const [loading, setLoading] = useState(false);

  const handleClear = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/clear-transaction", { method: "DELETE" });
      const data = await res.json();
      if (data && data.success) {
        console.log("Transaction cleared");
        if (typeof onCleared === "function") onCleared(data);
      } else {
        console.error("Failed to clear transaction", data);
      }
    } catch (err) {
      console.error("Error clearing transaction:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleClear} className="UpdateOrderButton" disabled={loading}>
      {loading ? "Clearing..." : "CLEAR TRANS"}
    </button>
  );
}
