import React from "react";

export default function CashierCostTable({
  transactionItems = [],
  selectedRow,
  setSelectedRow,
  lastRowRef,
}) {

  // Render transaction items as a flat list: each entry is either a main or not
  return (
    <>
      <div className="order-table-scroll">
        <table className="orderTable order-table">
          <thead>
            <tr>
              <th>Cost</th>
              <th>Item</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              // Build rows while computing a mapping from flat row -> order index (main index)
              let mainCounter = 0;
              let lastMainSeen = -1;
              return transactionItems.map((entry, idx) => {
                const isMain = entry.type === "main";
                const name = (entry && typeof entry.item === "object" && entry.item !== null) ? entry.item.name : entry.item;
                // Determine which order (main) this flat row belongs to
                let orderIndex;
                if (isMain) {
                  orderIndex = mainCounter;
                  lastMainSeen = mainCounter;
                  mainCounter += 1;
                } else {
                  orderIndex = lastMainSeen >= 0 ? lastMainSeen : 0;
                }

                const displayText = name;
                const isSelected = selectedRow === orderIndex;
                return (
                  <tr
                    key={`row-${idx}-${name || idx}`}
                    ref={idx === transactionItems.length - 1 ? lastRowRef : null}
                    className={isSelected ? "selected-row" : "clickable-row"}
                    onClick={() => setSelectedRow(orderIndex)}
                  >
                    <td>{isMain ? `$${entry.cost}` : ""}</td>
                    <td style={isMain ? {} : { paddingLeft: "2em" }}>{displayText}</td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>

    </>
  );
}
