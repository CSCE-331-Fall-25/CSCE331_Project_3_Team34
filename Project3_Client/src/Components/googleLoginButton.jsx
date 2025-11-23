import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function GoogleLoginButton({ returnTo = '/' }) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  return (
    
    <button onClick={() => {
        window.location.href = `${apiUrl}/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
        }}>
        Sign in with Google
    </button>
    
  ); 
}