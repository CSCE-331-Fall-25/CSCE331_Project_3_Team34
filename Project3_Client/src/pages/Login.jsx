import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import pandaLogo from '../assets/PandaLogo.svg';
import GoogleLoginButton from '../Components/googleLoginButton.jsx';
import { getImageForItem } from '../assets/utils/imageMapper';

export default function Login() {
  const [employeeId, setEmployeeId] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [customer, setCustomer] = useState(false);
  
  // Get returnTo and functionality from URL params or sessionStorage
  const urlReturnTo = searchParams.get('returnTo');
  const storedReturnTo = sessionStorage.getItem('loginReturnTo');
  const returnTo = urlReturnTo || storedReturnTo || '/';
  
  // Get functionality parameter (defaults to 0, checks sessionStorage too)
  const urlFunctionality = searchParams.get('functionality');
  const storedFunctionality = sessionStorage.getItem('loginFunctionality');
  const functionality = parseInt(urlFunctionality || storedFunctionality || '0');
  
  // Save returnTo and functionality to sessionStorage if it's in URL params
  useEffect(() => {
    if (urlReturnTo) {
      sessionStorage.setItem('loginReturnTo', urlReturnTo);
    }
    if (searchParams.get('functionality')) {
      sessionStorage.setItem('loginFunctionality', searchParams.get('functionality'));
      if(searchParams.get('functionality') == 3){
        setCustomer(true);
      }
    }
  }, [urlReturnTo, searchParams]);

  async function isValidLogin(userName, password) {
    try {
      const res = await fetch('/api/authenticate-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: userName, password: password, customer: customer })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        console.log('Login successful for user:', userName);
        return true;
      }
      console.log('Login failed for user:', userName, data);
      return false;
    } catch (error) {
      console.error('Error during login request:', error);
      return false;
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    const trimmedId = employeeId ? employeeId.trim() : '';
    const trimmedPassword = employeePassword ? employeePassword.trim() : '';
    if (!trimmedId || !trimmedPassword) {
      alert('Please enter both Username and Password.');
      return;
    }
    console.log("Logging in with ID:", employeeId, "and Password:", employeePassword);

    const ok = await isValidLogin(trimmedId, trimmedPassword);
    if (ok) {
        // if(typeof SucessfulLogin === "function") SucessfulLogin();
        console.log("Navigating to: " + returnTo);
      sessionStorage.removeItem('loginReturnTo');
      sessionStorage.removeItem('loginFunctionality');
      // Add success parameter based on functionality
      const successValue = functionality === 0 ? 1 : functionality + 1;
      const url = new URL(returnTo, window.location.origin);
      url.searchParams.set('success', successValue.toString());
      navigate(url.pathname + url.search, { replace: true });
    } else {
      //CONNOR here is where we can check functionality and see where we should return to
      console.log("Login failed, functionality: " + functionality);
      switch(functionality){
        case 1:
          alert('Invalid Login. Cannot access Manager functionality.');
          break;
        case 2:
          alert('Invalid Login.');
          return;
        case 3:
          alert('Invalid Login. Cannot access Customer functionality.');
          break;
        default:
          alert('Invalid Login.');
          break;
      }
      console.log("Navigating to: " + returnTo + " with success=0");
      // On failure, navigate with success=0
      const url = new URL(returnTo, window.location.origin);
      url.searchParams.set('success', '0');
      navigate(url.pathname + url.search, { replace: true });
      
    }
  }

  //called when returning from Google OAuth flow
  async function handleGoogleLogin(params, googleid = null) {
    //console.log('Handling Google Login callback');
    const isSuccess = params.get('success');
    const returnToParam = (params.get('returnTo') || '/').replace(/^\/?/, '/');
    const functionality = parseInt(params.get('functionality') || '0');
    const add = params.get('add');
    if (isSuccess === 'true') {
      // Fetch user info from backend
      const res = await fetch('/api/auth/me', { credentials: 'include' });

      if (res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if(!data || !data.user) {
          alert('Google Login Failed: No user data returned.');
          return;
        }

        let authorized = false;
        let redirectOverride = null;
        // Check roles based on functionality
        if (functionality === 1) { // Manager
            if (data.user.isEmployee && data.user.isManager) {
                authorized = true;
            } else if (data.user.isEmployee) {
                authorized = true;
                redirectOverride = '/cashier';
            } else {
                alert('Google Login Failed: User is not a Manager.');
            }
        } else if (functionality === 3) { // Customer
             // Assuming any logged in user can be a customer, or check specific logic
             authorized = true;
        } else { // Default to Employee (functionality 0 or others)
             if (data.user.isEmployee) {
                 authorized = true;
             } else {
                 alert('Google Login Failed: User is not an Employee.');
             }
        }

        if (authorized) {
          // Proceed with your logic
          if(add === 'true'){ 
            await fetch('/api/add-googleid', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: data.user.userName, googleid: '107052280673566149562' })
            });
            alert('added');
          }
          sessionStorage.removeItem('loginReturnTo');
          sessionStorage.removeItem('loginFunctionality');
          
          if (redirectOverride) {
            navigate(redirectOverride, { replace: true });
          } else {
            // Set success parameter based on functionality
            const successValue = functionality === 0 ? 1 : functionality + 1;
            const url = new URL(returnToParam, window.location.origin);
            url.searchParams.set('success', successValue.toString());
            navigate(url.pathname + url.search, { replace: true });
          }
        } else {
            // Not authorized, stay on login page
            navigate('/login', { replace: true });
        }
      } else {
        const text = await res.text();
        console.error('Non-JSON response from /auth/me:', text);
        alert('Google Login Failed: Server did not return JSON.');
      }
    } else if (isSuccess === 'false') {
      // On failure, stay on login page
      if (!window._googleLoginFailedAlerted) {
        window._googleLoginFailedAlerted = true;
        alert('Google Login Failed. Please try again.');
      }
      navigate('/login', { replace: true });
      return;
    }
  }

  function clearInputs() {
    setEmployeeId('');
    setEmployeePassword('');
  }

  // Check for Google login callback
  useEffect(() => {
    console.log('Login: checking for Google Login callback');
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      handleGoogleLogin(params);
      // Clear the URL parameters from the address bar
    }
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  // Clear inputs when shown
  useEffect(() => {
    clearInputs();
  }, []);

  function handleIdChange(event) {
    setEmployeeId(event.target.value);
  }

  function handlePasswordChange(event) {
    setEmployeePassword(event.target.value);
  }

  return (
    <div className="login-page-background">
      <div className="login-card">
        <img
          className="login-logo"
          src={pandaLogo}
          alt="Panda Express Logo"
        />
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Employee ID"
            value={employeeId ?? ''}
            onChange={handleIdChange}
          />
          <input
            type="password"
            placeholder="Password"
            value={employeePassword ?? ''}
            onChange={handlePasswordChange}
          />
          <button type="submit">Login</button>
        </form>
        {!customer && 
        <GoogleLoginButton returnTo={returnTo} functionality={functionality} />
        }
        <button className="debug-button" onClick={() => navigate("/hub")}>
          <img className='img' src={getImageForItem("debugbutton")} alt="Debug" />
          Debugging Skip Login
        </button>
      </div>
    </div>
  );
}