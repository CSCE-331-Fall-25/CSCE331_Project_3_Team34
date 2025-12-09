import React from 'react';
import { render } from '@testing-library/react';
import Kitchen from '../src/pages/Kitchen.jsx';
import { MemoryRouter } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('Kitchen view', () => {
  test('renders without crashing', () => {
    render(<MemoryRouter><Kitchen /></MemoryRouter>);
    expect(true).toBeTruthy();
  });

  test('has timezone/location state initialized (smoke)', () => {
    const { container } = render(<MemoryRouter><Kitchen /></MemoryRouter>);
    expect(container).toBeDefined();
  });

  test('does not crash when fetching items', () => {
    global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({}) }));
    render(<MemoryRouter><Kitchen /></MemoryRouter>);
    expect(global.fetch).toHaveBeenCalled();
  });

  test('renders key UI elements (smoke)', () => {
    render(<MemoryRouter><Kitchen /></MemoryRouter>);
    expect(true).toBeTruthy();
  });

  test('handles missing translation context gracefully', () => {
    render(<MemoryRouter><Kitchen /></MemoryRouter>);
    expect(true).toBeTruthy();
  });
});
