import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import '../styles/googleLoginButton.css';
import { getImageForItem } from '../assets/utils/imageMapper';

export default function GoogleLoginButton({ returnTo = '/' }) {
  const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, ''); // Remove trailing slash
  return (
    
    <button className="google-button" onClick={() => {
        window.location.href = `${apiUrl}/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
        }}>
        <img className='img' src={getImageForItem("google")} alt="Google" />
        Sign in with Google
    </button>
    
  ); 
}