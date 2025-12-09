import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Vite/browser-specific component that uses import.meta
jest.mock('../src/Components/googleLoginButton.jsx', () => {
  const React = require('react');
  return { __esModule: true, default: () => React.createElement('div', null, 'GoogleMock') };
});

// Provide a stable navigate mock for all tests and a default useSearchParams
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams('')]
}));

import Login from '../src/pages/Login.jsx';

describe('Login view', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  test('renders username and password inputs and login button', () => {
    render(<Login />);
    expect(screen.getByPlaceholderText('Employee ID')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('alerts when submitting empty credentials', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<Login />);
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(alertSpy).toHaveBeenCalledWith('Please enter both Username and Password.');
    alertSpy.mockRestore();
  });

  test('shows invalid login alert on server failure', async () => {
    // mock fetch for authenticate-login to return failure
    global.fetch = jest.fn((url, opts) => {
      if (url.includes('/api/authenticate-login')) {
        return Promise.resolve({ ok: false, json: () => Promise.resolve({ success: false }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText('Employee ID'), { target: { value: 'user1' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass1' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    alertSpy.mockRestore();
  });

  test('has google login button when not customer', () => {
    render(<Login />);
    expect(screen.queryByText(/google/i)).not.toBeNull();
  });

  test('navigates on successful login (calls navigate)', async () => {
    global.fetch = jest.fn((url, opts) => {
      if (url.includes('/api/authenticate-login')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText('Employee ID'), { target: { value: 'user1' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass1' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
  });
});
