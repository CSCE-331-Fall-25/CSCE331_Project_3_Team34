# Kiosk.jsx Integration Guide

## How to Add Translations to Kiosk.jsx

Follow these steps to integrate the translation system into your Kiosk component:

### Step 1: Add Imports

At the top of `Kiosk.jsx`, add:

```jsx
import { useContext, useState as useStateWithTranslation } from 'react';
import { TranslationContext } from '../contexts/TranslationContext';
import { useTranslatedText, useTranslatedArray } from '../hooks/useTranslatedText';
```

### Step 2: Get Translation Context in Component

Inside the Kiosk component function (after other state declarations), add:

```jsx
const { selectedLanguage } = useContext(TranslationContext);
```

### Step 3: Translate Common UI Strings

Add this hook for common translated strings:

```jsx
// Translate common UI labels
const tapToStartText = useTranslatedText("Tap To Start");
const selectItemText = useTranslatedText("Select an item");
const addToOrderText = useTranslatedText("Add to Order");
const removeFromOrderText = useTranslatedText("Remove from Order");
const checkoutText = useTranslatedText("Checkout");
const subtotalText = useTranslatedText("Subtotal");
const taxText = useTranslatedText("Tax");
const totalText = useTranslatedText("Total");
const proceedText = useTranslatedText("Proceed to Payment");
const entreeText = useTranslatedText("Entree");
const sideText = useTranslatedText("Side");
const quantityText = useTranslatedText("Quantity");
const sizeText = useTranslatedText("Size");
```

### Step 4: Replace Hardcoded Strings in JSX

Find these lines in your render section and replace them:

**Before:**
```jsx
<div className="tap-to-start">Tap To Start</div>
```

**After:**
```jsx
<div className="tap-to-start">{tapToStartText}</div>
```

### Step 5: Translate Dynamic Menu Content

For menu items coming from database/API, create a translation effect:

```jsx
const [translatedMenuItems, setTranslatedMenuItems] = useState([]);

useEffect(() => {
  const translateMenuItems = async () => {
    if (!menuItems.length) return;
    
    const context = useContext(TranslationContext);
    if (!context) return;
    
    // Extract names from menu items
    const itemNames = menuItems.map(item => item.name);
    
    // Translate all names
    const translated = await context.translateMultiple(itemNames);
    
    // Create new items with translated names
    const translatedItems = menuItems.map((item, index) => ({
      ...item,
      displayName: translated[index]
    }));
    
    setTranslatedMenuItems(translatedItems);
  };
  
  translateMenuItems();
}, [menuItems, selectedLanguage]);
```

Then use `translatedMenuItems` when displaying menu:

```jsx
{translatedMenuItems.map(item => (
  <div key={item.itemid}>{item.displayName}</div>
))}
```

### Step 6: Example - Full Button Translation

Replace this:
```jsx
<button className="buy-item-button" onClick={() => handleMenuTileClick(option)}>
  Add to Order
</button>
```

With this:
```jsx
<button className="buy-item-button" onClick={() => handleMenuTileClick(option)}>
  {addToOrderText}
</button>
```

### Step 7: Translate Selection Queue Labels

Update the `buildSelectionQueue` function to use translated labels:

**Current code:**
```jsx
function buildSelectionQueue(item) {
  if (!item) return [];
  const queue = [];
  if (item.type === 'meal') {
    const entreeCount = Number(item.numentrees ?? 0);
    const sideCount = Number(item.numsides ?? 0);
    for (let i = 0; i < entreeCount; i++) {
      queue.push({ type: 'entree', label: `Entree ${i + 1}` });
    }
    for (let i = 0; i < sideCount; i++) {
      queue.push({ type: 'side', label: `Side ${i + 1}` });
    }
  }
  // ... rest of function
}
```

**Updated code:**
```jsx
async function buildSelectionQueue(item) {
  if (!item) return [];
  const queue = [];
  
  if (item.type === 'meal') {
    const entreeCount = Number(item.numentrees ?? 0);
    const sideCount = Number(item.numsides ?? 0);
    
    // Translate labels
    const entreeLabel = await translate("Entree");
    const sideLabel = await translate("Side");
    
    for (let i = 0; i < entreeCount; i++) {
      queue.push({ type: 'entree', label: `${entreeLabel} ${i + 1}` });
    }
    for (let i = 0; i < sideCount; i++) {
      queue.push({ type: 'side', label: `${sideLabel} ${i + 1}` });
    }
  }
  // ... rest of function
}
```

### Step 8: Test Your Changes

1. Run the app: `npm run dev` (frontend) and `npm start` (backend)
2. Navigate to /weather
3. Select a different language from the dropdown
4. Navigate to /kiosk
5. Verify that UI text is in the selected language

## Complete Example: Translating Order Display

Here's a complete example of translating the order summary:

```jsx
// In your component state
const [translatedOrderItems, setTranslatedOrderItems] = useState([]);

// Add effect to translate order items when language changes
useEffect(() => {
  const translateOrder = async () => {
    if (!orderItems.length) return;
    
    const context = useContext(TranslationContext);
    if (!context) return;
    
    // Get all item names from order
    const itemNames = orderItems.map(item => item.name || item.itemName);
    
    // Translate them
    const translated = await context.translateMultiple(itemNames);
    
    // Map back to order items
    const updated = orderItems.map((item, index) => ({
      ...item,
      translatedName: translated[index]
    }));
    
    setTranslatedOrderItems(updated);
  };
  
  translateOrder();
}, [orderItems, selectedLanguage]);

// In your JSX, display translated items:
{translatedOrderItems.map((item, idx) => (
  <div key={idx} className="order-item">
    <span>{item.translatedName || item.name}</span>
    <span className="quantity">Qty: {item.quantity}</span>
    <span className="price">${item.price.toFixed(2)}</span>
  </div>
))}
```

## Common Translation Points in Kiosk

Here are the key text strings that should be translated in Kiosk.jsx:

1. **Navigation Labels:**
   - "Tap To Start"
   - "Back to Menu"
   - "Continue Shopping"

2. **Item Selection:**
   - "Select an item"
   - "Entree"
   - "Side"
   - "Drink"
   - "Size"
   - "Quantity"

3. **Cart Operations:**
   - "Add to Order"
   - "Remove from Order"
   - "Clear Cart"
   - "Update Item"

4. **Pricing:**
   - "Subtotal"
   - "Tax"
   - "Total"
   - "Price"

5. **Checkout:**
   - "Proceed to Payment"
   - "Checkout"
   - "Review Order"

6. **Status Messages:**
   - "Processing..."
   - "Order Placed"
   - "Thank You"
   - "Error occurred"

7. **Customization:**
   - "Customize"
   - "Done"
   - "Cancel"
   - "Confirm"

## Performance Tips

1. **Cache translations** - Already handled by TranslationContext
2. **Translate once** - Use `useTranslatedText` hook instead of inline translation
3. **Batch operations** - Use `translateMultiple` for several texts at once
4. **Lazy load** - Translate items only when they're displayed

## Error Handling

If translation fails, the component will display the original English text. This is handled automatically, but you can add your own error handling:

```jsx
const handleTranslationError = (originalText, error) => {
  console.warn(`Failed to translate "${originalText}":`, error);
  // Fallback to original text is automatic
};
```

## Debugging

To see what's being translated, open browser DevTools and:

1. Check Network tab for `/api/translate` requests
2. Look at the request/response body
3. Check that translatedText is coming back correctly
4. In console, check the TranslationContext value: `useContext(TranslationContext)`

---

**Next:** Once you've updated Kiosk.jsx, apply the same pattern to Menu.jsx, Kitchen.jsx, Cashier.jsx, and other components!
