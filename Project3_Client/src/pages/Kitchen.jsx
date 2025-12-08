import { useEffect, useMemo, useState, useContext } from 'react';
import { TranslationContext } from '../contexts/TranslationContext';
import { useTranslatedObject, useTranslatedText } from '../hooks/useTranslatedText';
import '../styles/Kitchen.css';

// Utility function to decode HTML entities
function decodeHTMLEntities(text) {
  if (!text) return text;
  // Handle both string and non-string inputs
  const str = typeof text === 'string' ? text : String(text);
  
  // Create a temporary element to leverage browser's HTML parser
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  const decoded = textarea.value;
  
  // Also handle numeric entities manually as backup
  let result = decoded;
  // Handle decimal numeric entities: &#39; &#160; etc
  result = result.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });
  // Handle hex numeric entities: &#x27; &#x3A; etc
  result = result.replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  return result;
}

// Configuration for the three kitchen display columns (labels will be translated)
const COLUMN_CONFIG = [
  { key: 'waiting', label: 'Waiting', endpoint: '/api/kitchen/get-not-started', leftButton: '', rightButton: 'Start'},
  { key: 'started', label: 'Started', endpoint: '/api/kitchen/get-in-progress', rightButton: 'Complete', leftButton: 'Back to Waiting' },
  { key: 'complete', label: 'Complete', endpoint: '/api/kitchen/get-completed', leftButton: 'Back to Started', rightButton: 'Clear' },
];

// How often to refresh order data from the backend (in milliseconds)
const pollIntervalMs = 8000;

export default function Kitchen() {
  // --- Translation system --- //
  const translationContext = useContext(TranslationContext);
  const selectedLanguage = translationContext?.selectedLanguage || 'en';
  const supportedLanguages = translationContext?.supportedLanguages || {};
  const setSelectedLanguage = translationContext?.setSelectedLanguage;

  // Prepare translation keys for all static UI text
  const translationKeys = useMemo(() => ({
    'Waiting': 'Waiting',
    'Started': 'Started',
    'Complete': 'Complete',
    'Start': 'Start',
    'CompleteBtn': 'Complete',
    'Clear': 'Clear',
    'Back to Waiting': 'Back to Waiting',
    'Back to Started': 'Back to Started',
    'No orders': 'No orders',
    'Unable to load kitchen tickets.': 'Unable to load kitchen tickets.',
    'Unable to update ticket stage.': 'Unable to update ticket stage.',
    'Unable to revert ticket stage.': 'Unable to revert ticket stage.',
    'Language': 'Language',
    'Customer Name': 'Customer Name',
    'Tray': 'Tray',
    'Tray:': 'Tray:',
    'Entree': 'Entree',
    'Drink': 'Drink',
    'Side': 'Side',
    'small': 'small',
    'medium': 'medium',
    'large': 'large',
  }), []);
  const translatedTexts = useTranslatedObject(translationKeys);
  const [translatedItemText, setTranslatedItemText] = useState({});
  // State: stores orders organized by stage (waiting, started, complete)
  const [tickets, setTickets] = useState(() => ({ waiting: [], started: [], complete: [] }));
  
  // State: tracks if data is currently being loaded
  const [loading, setLoading] = useState(false);
  
  // State: stores any error messages to display to the user
  const [error, setError] = useState(null);

  // Location/timezone state: detect user location and timezone to compute GMT offset
  const [location, setLocation] = useState(null);
  const [timezone, setTimezone] = useState(null);
  // Offset in minutes relative to GMT (positive means ahead of GMT)
  const [gmtOffsetMinutes, setGmtOffsetMinutes] = useState(0);

  // Column configuration for rendering the three columns (labels/buttons will be translated below)
  const columnDefinitions = useMemo(() => COLUMN_CONFIG.map(col => ({
    ...col,
    label: translatedTexts[col.label] || col.label,
    leftButton: col.leftButton ? (translatedTexts[col.leftButton] || col.leftButton) : '',
    rightButton: col.rightButton ? (translatedTexts[col.rightButton] || col.rightButton) : '',
  })), [translatedTexts]);

  // Translate dynamic ticket item text (names, trays) when language changes
  useEffect(() => {
    if (!translationContext) return;

    const stringsToTranslate = new Set();
    const stringMap = {}; // Map to preserve original strings with normalized keys

    Object.values(tickets || {}).forEach(colTickets => {
      (colTickets || []).forEach(ticket => {
        (ticket.items || []).forEach(item => {
          // Items are already decoded from server, so use directly
          const nameText = (typeof item === 'string' ? item : (item?.name ?? item))?.toString();
          if (nameText) {
            stringsToTranslate.add(nameText);
            stringMap[nameText] = nameText;
          }
          const trayText = (item?.tray)?.toString();
          if (trayText) {
            stringsToTranslate.add(trayText);
            stringMap[trayText] = trayText;
            // Extract category from tray (e.g., "Entree (small):" -> "Entree")
            const categoryMatch = trayText.match(/^(Entree|Drink|Side)/i);
            if (categoryMatch) {
              const cat = categoryMatch[1];
              stringsToTranslate.add(cat);
              stringMap[cat] = cat;
            }
            // Extract size from tray (e.g., "Entree (small):" -> "small")
            const sizeMatch = trayText.match(/\((small|medium|large)\)/i);
            if (sizeMatch) {
              const size = sizeMatch[1].toLowerCase();
              stringsToTranslate.add(size);
              stringMap[size] = size;
            }
          }
        });
      });
    });

    const payload = Array.from(stringsToTranslate);
    if (payload.length === 0) {
      setTranslatedItemText({});
      return;
    }

    // Clear when returning to English
    if (selectedLanguage === 'en') {
      const nextMap = {};
      payload.forEach(text => {
        nextMap[text] = text;
      });
      setTranslatedItemText(nextMap);
      return;
    }

    const doTranslate = async () => {
      try {
        const results = translationContext.translateMultiple
          ? await translationContext.translateMultiple(payload, selectedLanguage)
          : await Promise.all(payload.map(text => translationContext.translate(text, selectedLanguage)));

        const nextMap = {};
        payload.forEach((text, idx) => {
          const translated = results[idx] || text;
          // Store both the original and translated version
          // Use the original string as key to lookup translations
          nextMap[stringMap[text]] = translated;
        });
        setTranslatedItemText(nextMap);
      } catch (e) {
        console.error('Translation failed for kitchen items', e);
      }
    };

    doTranslate();
  }, [tickets, selectedLanguage, translationContext]);

  // Fetches order data for a single column from the backend
  // Returns an array of tickets or empty array if fetch fails
  async function fetchColumnData(column) {
      try {
        const res = await fetch(column.endpoint);
        if (!res.ok) throw new Error(`Failed to fetch ${column.label}`);
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error(err);
        throw err;
      }
    }

  // Loads data for all three columns simultaneously
  // Uses Promise.all to fetch all columns in parallel for better performance
  // isMounted parameter prevents state updates after component unmounts
  async function loadAll(isMounted) {
      setLoading(true);
      setError(null);
      try {
        // Fetch all columns in parallel
        const results = await Promise.all(
          columnDefinitions.map(async column => {
            const data = await fetchColumnData(column);
            // Decode HTML entities in all text fields immediately upon receiving
            const decodedData = data.map(ticket => ({
              ...ticket,
              items: (ticket.items || []).map(item => {
                if (typeof item === 'string') {
                  return decodeHTMLEntities(item);
                }
                return item?.name ? { ...item, name: decodeHTMLEntities(item.name) } : item;
              }),
              customername: ticket.customername ? decodeHTMLEntities(ticket.customername) : ticket.customername,
            }));
            return [column.key, decodedData];
          })
        );
        // Only update state if component is still mounted
        if (!isMounted) return;
        
        // Convert array of [key, data] pairs into an object
        const next = results.reduce((acc, [key, data]) => {
          acc[key] = data;
          return acc;
        }, {});
        
        // Merge new data with existing state
        setTickets(prev => ({ ...prev, ...next }));
      } catch (err) {
        if (!isMounted) return;
        setError(translatedTexts['Unable to load kitchen tickets.'] || 'Unable to load kitchen tickets.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

  // Effect: Sets up initial data load and polling interval
  // Runs once when component mounts
  useEffect(() => {
    let isMounted = true; // Track if component is still mounted to prevent memory leaks
    let intervalId;
    
    loadAll(isMounted); // Load all columns on mount
    
    // Set up automatic refresh every 8 seconds
    intervalId = setInterval(() => loadAll(isMounted), pollIntervalMs);
    
    // Cleanup function: runs when component unmounts
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [columnDefinitions]);

  // Detect user location and timezone, compute GMT offset
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          // Non-fatal: geolocation may be denied; we'll still attempt to get timezone from Intl
          console.warn('Geolocation error:', err?.message || err);
        }
      );
    }

    // Determine timezone and offset from the runtime environment (Intl + Date)
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(tz);
    } catch (e) {
      setTimezone(null);
    }

    // getTimezoneOffset returns minutes behind UTC (e.g., UTC+2 => -120)
    // We invert sign so positive means ahead of GMT (UTC+x)
    const offsetMinutes = -new Date().getTimezoneOffset();
    setGmtOffsetMinutes(offsetMinutes);
  }, []);

  // Advances an order to the next stage when clicked
  // Uses optimistic UI updates for instant feedback
  // Waiting -> Started -> Complete -> (removed from display)
  async function updateStage(transactionID) {
    if (!transactionID) return;
    
    // Optimistically update UI immediately
    setTickets(prev => {
      const updated = { ...prev };
      
      // Find which column contains this ticket
      for (const col of columnDefinitions) {
        const columnTickets = updated[col.key] || [];
        const ticketIndex = columnTickets.findIndex(
          t => (t.transactionid ?? t.id) === transactionID
        );
        
        if (ticketIndex !== -1) {
          const ticket = columnTickets[ticketIndex];
          // Remove from current column
          updated[col.key] = columnTickets.filter((_, i) => i !== ticketIndex);
          
          // Move to next stage column (if exists)
          const currentStageIndex = columnDefinitions.findIndex(c => c.key === col.key);
          if (currentStageIndex < columnDefinitions.length - 1) {
            const nextColumn = columnDefinitions[currentStageIndex + 1];
            updated[nextColumn.key] = [...(updated[nextColumn.key] || []), ticket];
          }
          // If it's the last column, just remove it (don't add anywhere)
          
          break;
        }
      }
      
      return updated;
    });
    
    // Send update to backend in background
    try {
      const res = await fetch('/api/kitchen/update-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionID }),
      });
      console.log('Updating stage for transaction ID:', transactionID);
      if (!res.ok) throw new Error('Failed to update stage');
      
      // Silently refresh from backend to ensure consistency
      // Don't await this - let it happen in background
      loadAll(true);
    } catch (err) {
      console.error(err);
      setError(translatedTexts['Unable to update ticket stage.'] || 'Unable to update ticket stage.');
      // Reload to revert optimistic update on error
      loadAll(true);
    }
  }

  async function revertStage(transactionID) {
    if (!transactionID) return;

    setTickets(prev => {
      const updated = { ...prev };

      for (const col of columnDefinitions) {
        const columnTickets = updated[col.key] || [];
        const ticketIndex = columnTickets.findIndex(
          t => (t.transactionid ?? t.id) === transactionID
        );

        if (ticketIndex !== -1) {
          const ticket = columnTickets[ticketIndex];
          updated[col.key] = columnTickets.filter((_, i) => i !== ticketIndex);

          const currentStageIndex = columnDefinitions.findIndex(c => c.key === col.key);
          if (currentStageIndex > 0) {
            const prevColumn = columnDefinitions[currentStageIndex - 1];
            updated[prevColumn.key] = [...(updated[prevColumn.key] || []), ticket];
          } else {
            // Already at earliest stage; keep it in current column
            updated[col.key] = [...(updated[col.key] || []), ticket];
          }

          break;
        }
      }

      return updated;
    });

    try {
      const res = await fetch('/api/kitchen/revert-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionID }),
      });
      console.log('Reverting stage for transaction ID:', transactionID);
      if (!res.ok) throw new Error('Failed to revert stage');

      loadAll(true);
    } catch (err) {
      console.error(err);
      setError(translatedTexts['Unable to revert ticket stage.'] || 'Unable to revert ticket stage.');
      loadAll(true);
    }
  }

  const [openTransactions, setOpenTransactions] = useState({});

  const toggle = (transactionID) => {
    setOpenTransactions((prev) => ({
      ...prev,
      [transactionID]: !prev[transactionID],
    }));
  }

  // Render: Three-column layout displaying order tickets at different stages
  // Each column shows tickets that can be clicked to advance to next stage
  return (
    <div className="kitchen-screen">
      {/* Language selector */}
      <div className="kitchen-language-picker" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span className="meta-label">{translatedTexts['Language'] || 'Language'}:</span>
        <select
          className="language-select"
          value={selectedLanguage}
          onChange={e => setSelectedLanguage && setSelectedLanguage(e.target.value)}
        >
          {Object.entries(supportedLanguages).map(([code, label]) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
      </div>
      {error && <div className="kitchen-error">{error}</div>}
      {/* Three columns: Waiting, Started, Complete */}
      <div className="kitchen-columns">
        {columnDefinitions.map(column => (
          <section key={column.key} className="kitchen-column">
            {/* Column header with count badge */}
            <h2 className="kitchen-column-title">
              {column.label}
              <span className="kitchen-count">{tickets[column.key]?.length ?? 0}</span>
            </h2>
            {/* Column body with tickets */}
            <div className="kitchen-column-body">
              {(tickets[column.key] ?? []).length === 0 && (
                <div className="kitchen-empty">{translatedTexts['No orders'] || 'No orders'}</div>
              )}
              {/* Render each ticket - click to advance stage */}
              {(tickets[column.key] ?? []).map(ticket => (
                <article
                  key={ticket.transactionid ?? ticket.id}
                  className="kitchen-ticket"
                  onClick={() => toggle(ticket.transactionid ?? ticket.id)}
                >
                  {openTransactions[ticket.transactionid ?? ticket.id]}
                  {/* Ticket header: ID and timestamp */}
                  <div className="kitchen-ticket-header">
                    <div className="kitchen-ticket-id">
                      #{ticket.transactionid ?? ticket.id ?? '—'}
                    </div>
                    {ticket.time && (
                      <div className="kitchen-ticket-time">
                        {(() => {
                          try {
                            // Parse ticket time and apply GMT offset (minutes)
                            const t = new Date(ticket.time);
                            if (isNaN(t.getTime())) return '—';
                            // Convert to UTC milliseconds, then add offset minutes
                            const adjusted = new Date(t.getTime() + gmtOffsetMinutes * 60 * 1000);
                            return adjusted.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            });
                          } catch (e) {
                            return new Date(ticket.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          }
                        })()}
                      </div>
                    )}
                  </div>
                  {openTransactions[ticket.transactionid ?? ticket.id] && (
                    <div className="kitchen-ticket-divider">
                      {ticket.customername && (
                        <div className="kitchen-ticket-name">{ticket.customername}</div>
                      )}
                      {/* List of items in the order */}
                      {Array.isArray(ticket.items) && ticket.items.length > 0 && (
                        <div className="kitchen-ticket-items">
                          {(ticket.items ?? []).map((item, idx) => {
                            // Items are already decoded from server
                            const itemName = typeof item === 'string' ? item : (item?.name ?? item);
                            const itemTray = item?.tray || null;
                            
                            // Get translation or fallback to original
                            const displayName = translatedItemText[itemName] !== undefined ? translatedItemText[itemName] : itemName;
                            
                            // Replace category names and sizes in tray with translated versions
                            let translatedTray = itemTray;
                            if (itemTray && selectedLanguage !== 'en') {
                              // First check if full tray is translated
                              if (translatedItemText[itemTray] !== undefined) {
                                translatedTray = translatedItemText[itemTray];
                              } else {
                                // Try to replace category and size
                                let tempTray = itemTray;
                                
                                // Replace category
                                const categoryMatch = itemTray.match(/^(Entree|Drink|Side)/);
                                if (categoryMatch) {
                                  const originalCategory = categoryMatch[1];
                                  const translatedCategory = translatedItemText[originalCategory];
                                  if (translatedCategory !== undefined) {
                                    tempTray = tempTray.replace(/^(Entree|Drink|Side)/, translatedCategory);
                                  }
                                }
                                
                                // Replace size in parentheses
                                const sizeMatch = itemTray.match(/\((small|medium|large)\)/i);
                                if (sizeMatch) {
                                  const originalSize = sizeMatch[1].toLowerCase();
                                  const translatedSize = translatedItemText[originalSize];
                                  if (translatedSize !== undefined) {
                                    tempTray = tempTray.replace(/\((small|medium|large)\)/i, `(${translatedSize})`);
                                  }
                                }
                                
                                translatedTray = tempTray;
                              }
                            }
                            
                            return (
                              <div key={idx} className="kitchen-ticket-item">
                                {displayName}
                                {/* If item has a tray property, show translated tray */}
                                {translatedTray && (
                                  <span className="kitchen-ticket-tray" style={{ marginLeft: 8, color: '#888', fontSize: '0.95em' }}>
                                    {' '}
                                    {translatedTexts['Tray:'] || 'Tray:'}{' '}
                                    {translatedTray}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="kitchen-ticket-actions">
                        {column.leftButton && (
                          <button
                            className="kitchen-ticket-left-button"
                            onClick={e => {
                              e.stopPropagation();
                              revertStage(ticket.transactionid ?? ticket.id);
                            }}
                          >
                            {column.leftButton}
                          </button>
                        )}
                        {column.rightButton && (
                          <button
                            className="kitchen-ticket-right-button"
                            onClick={e => {
                              e.stopPropagation();
                              updateStage(ticket.transactionid ?? ticket.id);
                            }}
                          >
                            {column.rightButton}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}