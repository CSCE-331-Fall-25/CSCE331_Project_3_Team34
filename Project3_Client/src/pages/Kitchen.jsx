import { useEffect, useMemo, useState } from 'react';
import '../styles/Kitchen.css';

const COLUMN_CONFIG = [
  { key: 'waiting', label: 'Waiting', endpoint: '/api/kitchen/get-not-started' },
  { key: 'started', label: 'Started', endpoint: '/api/kitchen/get-in-progress' },
  { key: 'complete', label: 'Complete', endpoint: '/api/kitchen/get-completed' },
];

const pollIntervalMs = 8000;

export default function Kitchen() {
  const [tickets, setTickets] = useState(() => ({ waiting: [], started: [], complete: [] }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const columnDefinitions = COLUMN_CONFIG;

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

  async function loadAll(isMounted) {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.all(
          columnDefinitions.map(async column => {
            const data = await fetchColumnData(column);
            return [column.key, data];
          })
        );
        if (!isMounted) return;
        const next = results.reduce((acc, [key, data]) => {
          acc[key] = data;
          return acc;
        }, {});
        setTickets(prev => ({ ...prev, ...next }));
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load kitchen tickets.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

  useEffect(() => {
    let isMounted = true;
    let intervalId;
    fetchColumnData();
    loadAll(isMounted);
    intervalId = setInterval(() => loadAll(isMounted), pollIntervalMs);
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [columnDefinitions]);

  async function updateStage(transactionID) {
    if (!transactionID) return;
    try {
      const res = await fetch('/api/kitchen/update-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionID }),
      });
      if (!res.ok) throw new Error('Failed to update stage');
      await loadAll();
    } catch (err) {
      console.error(err);
      setError('Unable to update ticket stage.');
    }
  }

  return (
    <div className="kitchen-screen">
      {error && <div className="kitchen-error">{error}</div>}
      <div className="kitchen-columns">
        {columnDefinitions.map(column => (
          <section key={column.key} className="kitchen-column">
            <h2 className="kitchen-column-title">
              {column.label}
              <span className="kitchen-count">{tickets[column.key]?.length ?? 0}</span>
            </h2>
            <div className="kitchen-column-body">
              {(tickets[column.key] ?? []).length === 0 && (
                <div className="kitchen-empty">No orders</div>
              )}
                {(tickets[column.key] ?? []).map(ticket => (
                  <article
                    key={ticket.transactionid ?? ticket.id}
                    className="kitchen-ticket"
                    onClick={() => updateStage(ticket.transactionid ?? ticket.id)} // <-- add here
                  >
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
                    {ticket.customername && (
                      <div className="kitchen-ticket-name">{ticket.customername}</div>
                    )}
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