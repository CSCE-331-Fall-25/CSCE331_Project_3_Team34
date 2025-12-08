// src/utils/orderPersistence.js
const STORAGE_KEYS = {
  kiosk: 'kiosk_order',
  cashier: 'cashier_order'
};

export const saveOrder = (orderItems, type = 'kiosk') => {
  try {
    sessionStorage.setItem(STORAGE_KEYS[type], JSON.stringify(orderItems));
  } catch (error) {
    console.error('Failed to save order:', error);
  }
};

export const loadOrder = (type = 'kiosk') => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS[type]);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load order:', error);
    return [];
  }
};

export const clearOrder = (type = 'kiosk') => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS[type]);
  } catch (error) {
    console.error('Failed to clear order:', error);
  }
};