import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function GoogleLoginButton() {
  return (
    
    <button onClick={() => {
        window.location.href = 'http://localhost:8080/auth/google';
        }}>
        Sign in with Google
    </button>
    
  ); 
}