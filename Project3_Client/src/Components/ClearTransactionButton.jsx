import React, { useState, useContext, useEffect } from "react";
import { TranslationContext } from "../contexts/TranslationContext";

export default function ClearTransactionButton({ onCleared }) {
  const translationContext = useContext(TranslationContext);
  const selectedLanguage = translationContext?.selectedLanguage || 'en';
  const [translatedTexts, setTranslatedTexts] = useState({
    'CLEAR TRANS': 'CLEAR TRANS',
    'Clearing...': 'Clearing...'
  });

  // Translate UI texts
  useEffect(() => {
    if (!translationContext) return;

    const translateUITexts = async () => {
      const uiTexts = ['CLEAR TRANS', 'Clearing...'];

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

  const handleClear = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/clear-transaction", { 
        method: "DELETE",
        credentials: 'include' // Include cookies with this request
      });
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
      {loading ? translatedTexts['Clearing...'] : translatedTexts['CLEAR TRANS']}
    </button>
  );
}
