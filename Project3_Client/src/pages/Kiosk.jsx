import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Kiosk() {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  function startTimer() {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => navigate('/weather'), 10000);
  }

  useEffect(() => {
    const events = ['click', 'mousemove', 'scroll'];
    
    function resetTimer() {
      startTimer();
    }

    events.forEach(event => window.addEventListener(event, resetTimer));

    startTimer(); // Start the timer on mount

    return () => {
      clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    }; // Cleanup on unmount
  }, [navigate]);

  return (
    <div>
      <h2>Kiosk (placeholder)</h2>
      <p>This is a simple placeholder component for the Kiosk view.</p>
      <p>This will time out in 10 (after last click) seconds to show functionality.</p>
    </div>
  );
}