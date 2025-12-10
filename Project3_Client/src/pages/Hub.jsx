import { data, Link, useNavigate } from "react-router-dom";
import "../styles/Hub.css";
import SignOutButton from "../Components/SignOut";
import React, { useEffect, useState } from "react";
import bobRoss from "../assets/bob-ross.png";


export default function Hub() {
  const [pendingLink, setPendingLink] = useState(false);

  const goFullscreen = () => {
    document.documentElement.requestFullscreen();
  };

  useEffect(() => {
    // Check if returning from Google OAuth with googleid
    const params = new URLSearchParams(window.location.search);
    if (params.get('link') === 'true' && params.get('googleid')) {
      // Remove link/googleid from URL immediately to prevent double execution
      window.history.replaceState({}, document.title, '/hub');
      const googleId = params.get('googleid');
      
      // Get current user and link the Google ID
      fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
      .then(response => response.json())
      .then(data => {
        if (data.user) {
          const username = data.user.username;
          if (!username) {
            alert('Error: Could not find username in session.');
            return;
          }
          
          // Link Google ID to current user
          fetch('/api/link-googleid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username: username, googleid: googleId })
          })
          .then(response => response.json())
          .then(linkData => {
            if (linkData.success) {
              alert('Google ID linked successfully!');
            } else {
              alert('Failed to link Google ID.');
            }
          })
          .catch(error => {
            console.error('Error linking Google ID:', error);
            alert('Error linking Google ID.');
          });
        } else {
          alert('No authenticated user. Please log in first.');
        }
      })
      .catch(error => {
        console.error('Error fetching authenticated user:', error);
        alert('Error fetching authenticated user.');
      });
    }
  }, []);

  const handleLinkGoogleId = () => {
    // Step 1: Check if user is logged in
    fetch('/api/auth/me', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
      if (data.user) {
        // Step 2: User is logged in, redirect to Google OAuth
        const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, ''); // Remove trailing slashes
        window.location.href = `${apiUrl}/auth/google?returnTo=${encodeURIComponent('/hub')}&link=true`;
      } else {
        alert('Please log in first before linking a Google account.');
      }
    })
    .catch(error => {
      console.error('Error checking authentication:', error);
      alert('Error checking authentication.');
    });
  };

  const handleUnlinkGoogleId = () => {
    // Step 1: Check if user is logged in
    fetch('/api/auth/me', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
      if (data.user) {
        const username = data.user.username;
        if (!username) {
          alert('No username found in session.');
          return;
        }
        // Step 2: Unlink Google ID for current user
        fetch('/api/unlink-googleid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username })
        })
        .then(response => response.json())
        .then(unlinkData => {
          if (unlinkData.success) {
            alert('Google ID unlinked successfully!');
          } else {
            alert('Failed to unlink Google ID.');
          }
        })
        .catch(error => {
          console.error('Error unlinking Google ID:', error);
          alert('Error unlinking Google ID.');
        });
      } else {
        alert('Please log in first before unlinking a Google account.');
      }
    })
    .catch(error => {
      console.error('Error checking authentication:', error);
      alert('Error checking authentication.');
    });
  };

  return (
    <main className="hub-wrapper">
      <h1 className="sr-only">Home Hub</h1>
      <img src={bobRoss} alt="Bob Ross Panda" className="hub-hero-image" />
      <div className="home-grid">
        <Link to="/weather"><button onClick={goFullscreen}>Kiosk</button></Link>
        <Link to="/cashier"><button>Cashier</button></Link>
        <Link to="/manager"><button>Manager</button></Link>
        <Link to="/menu"><button>Menu</button></Link>
        <Link to="/kitchen"><button>Kitchen</button></Link>
        <button className="google-btn" onClick={handleLinkGoogleId}>Link Google ID</button>
        <button className="google-btn" onClick={handleUnlinkGoogleId}>Unlink Google ID</button>
      </div>
    </main>
  );
}