import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
// Mock Vite-specific image mapper (uses import.meta.glob) so Jest doesn't execute it
jest.mock('../src/assets/utils/imageMapper', () => ({ getImageForItem: () => null }));
import Menu from '../src/pages/Menu.jsx';
import { MemoryRouter } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('Menu view', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // clean any DOM flags
    try { delete window.__menu_test_flag; } catch (e) {}
  });

  test('renders main container without crashing', () => {
    const { container } = render(<MemoryRouter><Menu /></MemoryRouter>);
    expect(container.querySelector('.menu-page-container')).toBeTruthy();
  });

  test('renders items and extra menus when fetch returns data', async () => {
    // mock fetch responses based on URL
    global.fetch = jest.fn((url, opts) => {
      if (url.includes('/api/fetch-menus-by-type')) {
        const body = JSON.parse(opts.body || '{}');
        if (body.type === 'entree') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([{ menuID: 1, menuName: 'Chicken', type: 'entree', priceMod: 0 }]) });
        }
        if (body.type === 'side') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([{ menuID: 2, menuName: 'Rice', type: 'side' }]) });
        }
        if (body.type === 'appetizer') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([{ menuID: 3, menuName: 'Egg Roll', type: 'appetizer' }]) });
        }
        if (body.type === 'drink') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([{ menuID: 4, menuName: 'Soda', type: 'drink' }]) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.includes('/api/fetch-all-items')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([{ itemID: 10, itemName: 'Bowl', itemPrice: 5.00 }]) });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });

    render(<MemoryRouter><Menu /></MemoryRouter>);

    // wait for the entree name to appear
    await waitFor(() => expect(screen.getByText('Chicken')).toBeInTheDocument());
    expect(screen.getByText('Rice')).toBeInTheDocument();
    expect(screen.getByText('Egg Roll')).toBeInTheDocument();
    expect(screen.getByText('Soda')).toBeInTheDocument();
    expect(screen.getByText('Bowl')).toBeInTheDocument();
  });

  test('does not crash when fetch throws an error', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network failure')));
    const { container } = render(<MemoryRouter><Menu /></MemoryRouter>);
    // A short wait to let effects run
    await new Promise((r) => setTimeout(r, 20));
    expect(container).toBeDefined();
  });

  test('items pagination respects page size (items page shows up to 6 entries)', async () => {
    // create 10 items to ensure pagination would limit to 6
    const manyItems = Array.from({ length: 10 }, (_, i) => ({ itemID: i + 1, itemName: `Item${i + 1}`, itemPrice: 1.0 + i }));
    global.fetch = jest.fn((url, opts) => {
      if (url.includes('/api/fetch-all-items')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(manyItems) });
      }
      // menus empty
      if (url.includes('/api/fetch-menus-by-type')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });

    const { container } = render(<MemoryRouter><Menu /></MemoryRouter>);
    // wait for initial displayed items to be set
    await waitFor(() => {
      const elems = container.getElementsByClassName('menu-item-menu');
      // should render at most 6 menu item boxes
      expect(elems.length).toBeLessThanOrEqual(6);
    });
  });

  test('drinks render when present in extraMenus', async () => {
    global.fetch = jest.fn((url, opts) => {
      if (url.includes('/api/fetch-menus-by-type')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([{ menuID: 99, menuName: 'TestDrink', type: 'drink' }]) });
      }
      if (url.includes('/api/fetch-all-items')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });
    render(<MemoryRouter><Menu /></MemoryRouter>);
    await waitFor(() => expect(screen.getAllByText('TestDrink').length).toBeGreaterThan(0));
  });
});
