import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool, setPool } from "./db.js";
import CashierMainPage from "./MainPage.js";
import User, {Employee, Customer} from "./User.js";
import { Report } from "./Reports.js";
import Item, { Menu } from "./Item.js";

// Kiosk router file is named `Kiosk.js` (capital K). Use the exact filename so imports work
// on case-sensitive filesystems (e.g. Linux used by many CI/CD hosts).
import kioskRouter from "./Kiosk.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Example: create a test user and main page instance (pass the pool so it has DB access)
const user = new User("testUser", "password123", "bob@gmail.com");
const mainPage = new CashierMainPage(user, pool);
const reports = new Report(pool);
app.use('/api/kiosk', kioskRouter);

// API endpoint to fetch menus by type
app.post('/api/fetch-menus-by-type', async (req, res) => {
  try {
    const { type } = req.body;
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }
    const menus = await Menu.fetchByType(pool, type);
    res.json(menus.map(menu => ({
      menuID: menu.menuid,
      menuName: menu.name,
      type: menu.type,
      priceMod: menu.pricemod,
      inventoryIDs: menu.inventoryids
    })));
  } catch (err) {
    console.error('Error fetching menus by type:', err);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
});

app.post('/api/fetch-all-items', async (req, res) => {
  try {
    const items = await Item.fetchAllItems(pool);
    res.json(items.map(item => ({
      itmeID: item.itemid,
      itemName: item.name, 
      itemPrice: item.price, 
      numSides: item.numsides, 
      numEntrees: item.numentrees, 
      invIDs: item.inventoryids, 
      type: item.type
    })));
  } catch (err) {
    console.error('Error fetching items by type:', err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// API endpoint to buy an item
app.post('/api/buy-item', async (req, res) => {
  try {
    let result;
    if (req.body && req.body.itemID) {
      result = await mainPage.BuyItemButton(req.body.itemID, req.body.entreeList, req.body.sideList);
    } else {
      result = await mainPage.BuyItemButton();
    }
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Error in /api/buy-item:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// API endpoint to add a discount
app.post('/api/add-discount', async (req, res) => {
  const { discountCode } = req.body;
  let result = { acceptedDiscount: false };
  try {
    if (discountCode) {
      result = await mainPage.AddDiscount(discountCode);
      console.log('Discount result:', result);
    }
    res.json({
      success: result.acceptedDiscount,
      acceptedDiscount: result.acceptedDiscount,
      discountPer: result.discountPer || 0,
      priceOff: result.priceOff || 0,
      discountAmount: result.discountAmount || 0 
    });
  } catch (err) {
    console.error('Error applying discount:', err);
    res.status(500).json({ 
      success: false, 
      acceptedDiscount: false, 
      error: 'Failed to apply discount' 
    });
  }
});

// API endpoint to clear the transaction
app.delete('/api/clear-transaction', (req, res) => {
  mainPage.ClearTransaction();
  res.json({ success: true });
});
// API endpoint to purchase the transaction
app.post('/api/purchase', (req, res) => {
  mainPage.PurchaseTransaction();
  res.json({ success: true });
  
});

// Simple route
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM employees");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// API endpoint to get current state
app.get("/api/current-state", (req, res) => {
  let result = mainPage.GetCurrentState();
  res.json(result);
});
// API endpoint to remove an item by index
app.post('/api/remove-item', (req, res) => {
  const { index } = req.body;
  let result = mainPage.RemoveItemByIndex(index);
  res.json({ success: true, ...result });
});
//API endpoint to customize an order
app.post('/api/customize-order', (req, res) => {
  const { index } = req.body;
  let result = mainPage.CustomizeOrder(index);
  res.json({ success: true, ...result });
});
// Lightweight health endpoint for tests and readiness checks
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});


// Reports API endpoints
app.post('/api/x-report-data', async (req, res) => {
  try {
    console.log("request recieved");
    res.json(await reports.XReportData());
  } catch (err) {
    console.error('Error getting data');
    res.json({ 
      hour: -1, 
      sales: -1,
    });
  }
});

app.get('/api/x-report-data', async (req, res) => {
  try {
    console.log("request recieved");
    res.json(await reports.XReportData());
  } catch (err) {
    console.error('Error getting data');
    res.json({ 
      hour: -1, 
      sales: -1,
    });
  }
});

app.get('/api/z-report-data', async (req, res) => {
  try {
    console.log("request recieved");
    res.json(await reports.ZReportData());
  } catch (err) {
    console.error('Error getting data');
    res.json({ 
      hour: -1, 
      sales: -1,
    });
  }
});

app.post('/api/sales-report-data', async (req, res) => {
  try {
    console.log("request recieved");
    const { startTime, endTime } = req.body;
    res.json(await reports.SalesReportData(startTime, endTime));
  } catch (err) {
    console.error('Error getting data' + err);
    res.json({ 
      menuid: -1, 
      name: -1, 
      sales: -1,
      code: 4096
    });
  }
});

app.post('/api/product-usage-report-data', async (req, res) => {
  try {
    console.log("request recieved");
    const { startTime, endTime } = req.body;
    res.json(await reports.ProductUsageReportData(startTime, endTime));
  } catch (err) {
    console.error('Error getting data' + err);
    res.json({ 
      inventoryid: -1, 
      name: -1, 
      sales: -1,
      code: 4096
    });
  }
});

app.get('/api/restock-report-data', async (req, res) => {
  try {
    console.log("request recieved");
    res.json(await reports.RestockReportData());
  } catch (err) {
    console.error('Invalid input data');
    res.json({ 
      itemid: -1, 
      name: -1, 
      quantity: -1
    });
  }
});


import path from "path";
import { fileURLToPath } from "url";

// Get absolute directory path (needed since we’re in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve React build folder (adjust if you used CRA instead of Vite)
app.use(express.static(path.join(__dirname, "../../Project3_Client/dist")));

// ✅ For any non-API route, serve index.html so React handles client-side routing (Express 5+ best practice)
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next(); // skip API routes
  res.sendFile(path.join(__dirname, "../../Project3_Client/dist/index.html"));
});

const PORT = process.env.PORT || 8080;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

export default app;