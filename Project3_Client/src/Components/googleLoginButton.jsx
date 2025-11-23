import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function GoogleLoginButton() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  return (
    
    <button onClick={() => {
        window.location.href = `${apiUrl}/auth/google`;
        }}>
        Sign in with Google
    </button>
    
  ); 
}