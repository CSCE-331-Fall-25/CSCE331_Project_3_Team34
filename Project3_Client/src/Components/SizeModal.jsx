import React, { useContext, useEffect, useState } from "react";
import { createPortal } from 'react-dom';
import "../styles/Cashier/SizeModal.css";
import { TranslationContext } from "../contexts/TranslationContext";

export default function SizeModal({ onClose, sizes = [], onSelectSize }) {
    const translationContext = useContext(TranslationContext);
    const selectedLanguage = translationContext?.selectedLanguage || 'en';
    const [translatedTexts, setTranslatedTexts] = useState({
        'Select Size': 'Select Size',
        'Close': 'Close'
    });
    const [translatedSizes, setTranslatedSizes] = useState({});

    // Translate UI texts
    useEffect(() => {
        if (!translationContext) return;

        const translateUITexts = async () => {
            const uiTexts = ['Select Size', 'Close'];

            if (selectedLanguage === 'en') {
                const english = {};
                uiTexts.forEach(text => english[text] = text);
                setTranslatedTexts(english);
                return;
            }

            try {
                const translations = await translationContext.translateMultiple(uiTexts, selectedLanguage);
                const map = {};
                uiTexts.forEach((t, i) => { map[t] = translations[i] || t; });
                setTranslatedTexts(map);
            } catch (error) {
                console.error('Failed to translate UI texts:', error);
                const fallback = {};
                uiTexts.forEach(text => fallback[text] = text);
                setTranslatedTexts(fallback);
            }
        };

        translateUITexts();
    }, [selectedLanguage]);

    // Translate size options
    useEffect(() => {
        if (!translationContext || sizes.length === 0) return;

        const translateSizeOptions = async () => {
            if (selectedLanguage === 'en') {
                const english = {};
                sizes.forEach(size => english[size] = size);
                setTranslatedSizes(english);
                return;
            }

            try {
                const translations = await translationContext.translateMultiple(sizes, selectedLanguage);
                const map = {};
                sizes.forEach((size, i) => { map[size] = translations[i] || size; });
                setTranslatedSizes(map);
            } catch (error) {
                console.error('Failed to translate sizes:', error);
                const fallback = {};
                sizes.forEach(size => fallback[size] = size);
                setTranslatedSizes(fallback);
            }
        };

        translateSizeOptions();
    }, [sizes, selectedLanguage]);
    if (sizes.length === 0) console.error("No sizes provided to SizeModal");
    if (typeof onClose !== 'function') console.error("onClose is not a function");
    if (typeof onSelectSize !== 'function') console.error("onSelectSize is not a function");

    if (typeof document === 'undefined') return null;

    const modal = (
        <div className="modal-overlay" onClick={() => onClose()}>
            <div className="modal-window" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">{translatedTexts['Select Size']}</h2>
                <div className="size-options">
                    {sizes.map((size) => (
                        <button className={`size-button`} key={size} onClick={() => onSelectSize(size)}>
                            {translatedSizes[size] || size}
                        </button>
                    ))}
                </div>
                <div className="modal-actions">
                    <button onClick={() => onClose()} className="modal-close">
                        {translatedTexts['Close']}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}