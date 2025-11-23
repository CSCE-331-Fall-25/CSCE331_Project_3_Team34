import { useEffect, useMemo, useState } from 'react';
import '../styles/Kitchen.css';

// Configuration for the three kitchen display columns
// Each column shows orders at different stages of preparation
const COLUMN_CONFIG = [
  { key: 'waiting', label: 'Waiting', endpoint: '/api/kitchen/get-not-started' },
  { key: 'started', label: 'Started', endpoint: '/api/kitchen/get-in-progress' },
  { key: 'complete', label: 'Complete', endpoint: '/api/kitchen/get-completed' },
];

// How often to refresh order data from the backend (in milliseconds)
const pollIntervalMs = 8000;

export default function Kitchen() {
  // State: stores orders organized by stage (waiting, started, complete)
  const [tickets, setTickets] = useState(() => ({ waiting: [], started: [], complete: [] }));
  
  // State: tracks if data is currently being loaded
  const [loading, setLoading] = useState(false);
  
  // State: stores any error messages to display to the user
  const [error, setError] = useState(null);

  // Column configuration for rendering the three columns
  const columnDefinitions = COLUMN_CONFIG;

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
            return [column.key, data];
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
        setError('Unable to load kitchen tickets.');
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
      if (!res.ok) throw new Error('Failed to update stage');
      
      // Silently refresh from backend to ensure consistency
      // Don't await this - let it happen in background
      loadAll(true);
    } catch (err) {
      console.error(err);
      setError('Unable to update ticket stage.');
      // Reload to revert optimistic update on error
      loadAll(true);
    }
  }

  // Render: Three-column layout displaying order tickets at different stages
  // Each column shows tickets that can be clicked to advance to next stage
  return (
    <div className="kitchen-screen">
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
                <div className="kitchen-empty">No orders</div>
              )}
              
                {/* Render each ticket - click to advance stage */}
                {(tickets[column.key] ?? []).map(ticket => (
                  <article
                    key={ticket.transactionid ?? ticket.id}
                    className="kitchen-ticket"
                    onClick={() => updateStage(ticket.transactionid ?? ticket.id)}
                  >
                    {/* Ticket header: ID and timestamp */}
                    <div className="kitchen-ticket-header">
                      <div className="kitchen-ticket-id">
                        #{ticket.transactionid ?? ticket.id ?? '—'}
                      </div>
                      {ticket.time && (
                        <div className="kitchen-ticket-time">
                          {new Date(ticket.time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </div>
                    
                    {/* Optional customer name */}
                    {ticket.customername && (
                      <div className="kitchen-ticket-name">{ticket.customername}</div>
                    )}
                    
                    {/* List of items in the order */}
                    {Array.isArray(ticket.items) && ticket.items.length > 0 && (
                      <div className="kitchen-ticket-items">
                        {(ticket.items ?? []).map((item, idx) => (
                          <div key={idx} className="kitchen-ticket-item">
                            {item.name ?? item}
                          </div>
                        ))}
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