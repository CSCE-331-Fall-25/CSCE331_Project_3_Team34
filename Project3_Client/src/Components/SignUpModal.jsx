import React, { useState } from 'react';

export default function SignUpModal({ show, onClose, onSignUp }) {
  const [customerName, setCustomerName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validate inputs
    if (!customerName.trim() || !username.trim() || !password.trim() || !email.trim()) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }
    setLoading(true);

    try {
      // Call the signup endpoint (you'll need to create this on the backend)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch('/api/signup-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: controller.signal,
        body: JSON.stringify({
          name: customerName.trim(),
          username: username.trim(),
          password: password.trim(),
          email: email.trim()
        })
      });
      clearTimeout(timeoutId);

      const data = await res.json();

      if (res.ok && data.success) {
        //console.log('Sign up successful for customer:', username);
        // Call the parent callback to handle successful signup
        if (typeof onSignUp === 'function') {
          onSignUp();
        }
        handleClose();
      } else {
        setErrorMessage(data.error || 'Sign up failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      if (error.name === 'AbortError') {
        setErrorMessage('Request timed out. Please try again.');
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCustomerName('');
    setUsername('');
    setPassword('');
    setEmail('');
    setErrorMessage('');
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Create Customer Account</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            placeholder="Full Name"
            id="signup-fullname"
            aria-label="Full Name"
            />
          <input
            type="text"
            placeholder="Full Name"
            id="signup-fullname"
            aria-label="Full Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="modal-input"
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Username"
            id="signup-username"
            aria-label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="modal-input"
            disabled={loading}
          />
          <input
            type="email"
            placeholder="Email"
            id="signup-email"
            aria-label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="modal-input"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            id="signup-password"
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="modal-input"
            disabled={loading}
          />           

          {errorMessage && (
            <div className="modal-error" style={{ color: '#dc3545', fontSize: '14px', marginBottom: '8px' }}>
              {errorMessage}
            </div>
          )}

          <div className="modal-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleClose}
              className="modal-back"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-submit"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

SignUpModal.displayName = 'SignUpModal';
