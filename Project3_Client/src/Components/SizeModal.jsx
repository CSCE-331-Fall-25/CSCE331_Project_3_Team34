import React from "react";
import { createPortal } from 'react-dom';
import "../styles/Cashier/SizeModal.css";

export default function SizeModal({ onClose, sizes = [], onSelectSize }) {
    if (sizes.length === 0) console.error("No sizes provided to SizeModal");
    if (typeof onClose !== 'function') console.error("onClose is not a function");
    if (typeof onSelectSize !== 'function') console.error("onSelectSize is not a function");

    if (typeof document === 'undefined') return null;

    const modal = (
        <div className="modal-overlay" onClick={() => onClose()}>
            <div className="modal-window" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Select Size</h2>
                <div className="size-options">
                    {sizes.map((size) => (
                        <button className={`size-button`} key={size} onClick={() => onSelectSize(size)}>
                            {size}
                        </button>
                    ))}
                </div>
                <div className="modal-actions">
                    <button onClick={() => onClose()} className="modal-close">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}