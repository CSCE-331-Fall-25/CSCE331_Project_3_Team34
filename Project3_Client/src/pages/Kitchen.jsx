import React, { use, useEffect, useMemo, useState } from 'react';
import "../styles/Kitchen.css";
import pandaLogo from '../assets/PandaLogo.svg';

import { getImageForItem } from "../assets/utils/imageMapper";


export default function Kitchen() {

  const [orders, setOrders] = useState([
    { id: 101, state: "Queued", contents: ["Orange Chicken", "Fried Rice"] },
    { id: 102, state: "Working", contents: ["Beef Broccoli", "Chow Mein"] },
    { id: 103, state: "Done", contents: ["Teriyaki Chicken"] },
  ]);
  
  const grouped = {
    Queued: orders.filter(o => o.state === "Queued"),
    Working: orders.filter(o => o.state === "Working"),
    Done: orders.filter(o => o.state === "Done"),
  };

  return (
    <div className="order-board">
      {["Queued", "Working", "Done"].map(state => (
        <div key={state} className="column">
          <h2 className="column-title">{state}</h2>

          <div className="card-list">
            {grouped[state].map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <span className="order-number">Order #{order.id}</span>
                </div>

                <div className="order-contents">
                  {order.contents.map((item, idx) => (
                    <div key={idx} className="order-item">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}