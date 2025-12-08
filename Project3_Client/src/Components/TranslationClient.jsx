import { useContext } from 'react';
import { TranslationContext } from '../contexts/TranslationContext';
import '../styles/TranslationClient.css';

export default function TranslationClient() {
  const { selectedLanguage, setSelectedLanguage, supportedLanguages } = useContext(TranslationContext);

  return (
    <div className="translation-client-container">
      <label htmlFor="language-select" className="translation-label">Select Language:</label>
      <select
        id="language-select"
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
        className="language-select language-select-weather"
      >
        {Object.entries(supportedLanguages).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}
