import React, { useState, useContext, useEffect } from "react";
import { TranslationContext } from "../contexts/TranslationContext";

export default function RemoveItemButton({ index, onRemoved }) {
  const translationContext = useContext(TranslationContext);
  const selectedLanguage = translationContext?.selectedLanguage || 'en';
  const [translatedTexts, setTranslatedTexts] = useState({
    'REMOVE': 'REMOVE',
    'Removing...': 'Removing...'
  });

  // Translate UI texts
  useEffect(() => {
    if (!translationContext) return;

    const translateUITexts = async () => {
      const uiTexts = ['REMOVE', 'Removing...'];

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
    } catch (err) {np
      console.error("Error removing item:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleRemove} className="UpdateOrderButton" disabled={loading || index === null || index === undefined}>
      {loading ? translatedTexts['Removing...'] : translatedTexts['REMOVE']}
    </button>
  );
}
