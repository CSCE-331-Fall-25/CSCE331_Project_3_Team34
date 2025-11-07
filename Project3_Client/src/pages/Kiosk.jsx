import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Kiosk() {

  // --- Inactivity timer logic --- //

  const navigate = useNavigate();
  const timerRef = useRef(null);

  function startTimer() {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => navigate('/weather'), 10000000);
  }

  useEffect(() => {
    const events = ['click', 'mousemove', 'scroll'];
    
    function resetTimer() {
      startTimer();
    }

    events.forEach(event => window.addEventListener(event, resetTimer, { passive: true }));

    startTimer(); // Start the timer on mount

    return () => {
      clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    }; // Cleanup on unmount
  }, [navigate]);

  // --- Item button generate logic --- //

  const [entrees, setEntrees] = useState([]);

  useEffect(() => {
    fetch("/api/get-entrees")
      .then(res => res.json())
      .then(data => setEntrees(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      {entrees.map(item => (
        <button
          key={item.id}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}