import React from "react";
import PurchaseButton from "./PurchaseButton.jsx";

export default function CashierCostTable({
  transactionItems = [],
  selectedRow,
  setSelectedRow,
  lastRowRef,
  currCost = 0,
  TAXRATE = 0.0825,
  discountAmount = 0,
  discountPriceOff = 0,
  onPurchase,
}) {
  // Group transactionItems into mains with entrees/sides
  const grouped = [];
  let i = 0;
  while (i < transactionItems.length) {
    if (transactionItems[i].type === "main") {
      const main = transactionItems[i];
      const group = { main, entrees: [], sides: [] };
      let j = i + 1;
      while (j < transactionItems.length && transactionItems[j].type !== "main") {
        if (transactionItems[j].type === "entree") group.entrees.push(transactionItems[j]);
        if (transactionItems[j].type === "side") group.sides.push(transactionItems[j]);
        j++;
      }
      grouped.push(group);
      i = j;
    } else {
      i++;
    }
  }

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
            {grouped.map((group, mainIdx) => (
              <React.Fragment key={`group-${mainIdx}`}>
                <tr
                  key={`main-${mainIdx}`}
                  ref={mainIdx === grouped.length - 1 ? lastRowRef : null}
                  className={mainIdx === selectedRow ? "selected-row" : "clickable-row"}
                  onClick={() => setSelectedRow(mainIdx)}
                >
                  <td>{`$${group.main.cost}`}</td>
                  <td>
                    {group.main && typeof group.main.item === "object" && group.main.item !== null
                      ? group.main.item.name
                      : group.main.item}
                  </td>
                </tr>

                {group.entrees.map((entree, eIdx) => (
                  <tr key={`main-${mainIdx}-entree-${eIdx}-${entree?.item?.name || eIdx}`} className="subrow">
                    <td></td>
                    <td style={{ paddingLeft: "2em" }}>{`Entree: ${
                      typeof entree.item === "object" && entree.item !== null ? entree.item.name : entree.item
                    }`}</td>
                  </tr>
                ))}

                {group.sides.map((side, sIdx) => (
                  <tr key={`main-${mainIdx}-side-${sIdx}-${side?.item?.name || sIdx}`} className="subrow">
                    <td></td>
                    <td style={{ paddingLeft: "2em" }}>{`Side: ${
                      typeof side.item === "object" && side.item !== null ? side.item.name : side.item
                    }`}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="order-stats">
        <p>Total Cost: ${(currCost).toFixed(2)}</p>
        <p>Discount Amount: ${typeof discountAmount === "number" ? discountAmount.toFixed(2) : "0.00"}</p>
        <p>Tax: ${(currCost * TAXRATE).toFixed(2)}</p>
        <p>
          Price Total: ${((currCost - (typeof discountAmount === "number" ? discountAmount : 0)) + TAXRATE * currCost).toFixed(2)}
        </p>
      </div>

  {/* Purchase button (render PurchaseButton here so it appears in the original location) */}
  <PurchaseButton onPurchased={onPurchase} />
    </>
  );
}
