import { data, Link, useNavigate } from "react-router-dom";
import "../styles/Hub.css";
import SignOutButton from "../Components/SignOut";
import React, { useEffect, useState } from "react";


export default function Hub() {
  const [pendingLink, setPendingLink] = useState(false);

  useEffect(() => {
    // Check if returning from Google OAuth with googleid
    const params = new URLSearchParams(window.location.search);
    if (params.get('link') === 'true' && params.get('googleid')) {
      const googleId = params.get('googleid');
      
      // Get current user and link the Google ID
      fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
      .then(response => response.json())
      .then(data => {
        console.log('Auth/me response:', data);
        if (data.user) {
          const username = data.user.username;
          console.log('Username to link:', username);
          
          if (!username) {
            console.error('No username found in user object:', data.user);
            alert('Error: Could not find username in session.');
            window.history.replaceState({}, document.title, '/hub');
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
            // Clean up URL
            window.history.replaceState({}, document.title, '/hub');
          })
          .catch(error => {
            console.error('Error linking Google ID:', error);
            alert('Error linking Google ID.');
          });
        } else {
          alert('No authenticated user. Please log in first.');
          window.history.replaceState({}, document.title, '/hub');
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
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
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

  return (
    <div className="home-grid">
        <Link to="/weather"><button>Kiosk</button></Link>
        <Link to="/cashier"><button>Cashier</button></Link>
        <Link to="/manager"><button>Manager</button></Link>
        <Link to="/menu"><button>Menu</button></Link>
        <Link to="/kitchen"><button>Kitchen</button></Link>
        <button onClick={handleLinkGoogleId}>Link Google ID</button>
         
        
        
    </div>
    );
}