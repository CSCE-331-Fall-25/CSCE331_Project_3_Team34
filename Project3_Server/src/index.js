import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool, setPool } from "./db.js";
import CashierMainPage from "./MainPage.js";
import User, {Employee, Customer} from "./User.js";
import { Manager } from "./Manager.js";
import Item, { Menu } from "./Item.js";
import session from "express-session";
import cookieParser from "cookie-parser";

// Kiosk router file is named `Kiosk.js` (capital K). Use the exact filename so imports work
// on case-sensitive filesystems (e.g. Linux used by many CI/CD hosts).
import kioskRouter from "./Kiosk.js";

dotenv.config();

const app = express();
// Configure CORS and sessions so client (Vite) can communicate with backend and receive cookies
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const sessionPrefab = session({
  secret: process.env.SESSION_SECRET || 'default_secret', // TODO: change to strong secret in production
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 60 * 60 * 1000 // 1 hour
  }
});

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());

app.use(cookieParser());
app.use(sessionPrefab);

// a map to hold session-scoped main page instances
const sessionMap = new Map();

function getMainPageForSession(req) {
  // ensure sessions exist
  if (!req.session) return mainPage; // fallback to global mainPage if sessions unavailable
  const sessionID = req.session.id;
  if (!sessionMap.has(sessionID)) {
    const user = new User("tempUser", "tempPass", "temp@gmail.com");
    const mp = new CashierMainPage(user, pool);
    sessionMap.set(sessionID, mp);
    req.session.initialized = true;
    console.log(`Initialized new session: ${sessionID}`);
  } else {
    // console.log(`Using existing session: ${sessionID}`);
  }
  return sessionMap.get(sessionID);
}

// API endpoint to authenticate login
app.post('/api/authenticate-login', async (req, res) => {
  try{
    const { username, password } = req.body;
    const user = await User.AuthenticateLogin(pool, username, password);
    if(!user) {
        return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }
    // set user on session and regenerate to prevent fixation
    req.session.user = { username: user.username, isEmployee: user.isEmployee };
    req.session.regenerate((err) => {
      if(err) {
        console.error('Session regeneration error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
      }
      req.session.user = { username: user.username, isEmployee: user.isEmployee };
      try {
        sessionMap.set(req.session.id, new CashierMainPage(user, pool));
      } catch (e) {
        console.error('Failed to create session main page:', e);
      }
      return res.json({ success: true });
    });
  }
  catch(err){
      console.error('Error during authentication:', err);
      return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/logout', (req,res)=>{
  if (req.session) console.log(`Session ${req.session.id} logged out and resources cleared.`);
  if (req.session) sessionMap.delete(req.session.id);
  if (req.session) {
    req.session.destroy(err => {
      res.clearCookie('connect.sid');
      return res.json({ success: !err });
    });
  } else {
    return res.json({ success: true });
  }
});
app.use(express.json());

//gets the current signed in user for this session
app.get('/api/get-user', async (req, res) => {
  const currUser = req.session?.user ?? null;
  if(!currUser) return res.status(401).json({ success: false, error: 'Not authenticated' });
  res.json({ success: true, user: currUser });

});

// Example: create a test user and main page instance (pass the pool so it has DB access)
const user = new User("testUser", "password123", "bob@gmail.com");
const mainPage = new CashierMainPage(user, pool);
const manager = new Manager(pool, "testUser");
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
    const mainPage = getMainPageForSession(req);
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
  const mainPage = getMainPageForSession(req);
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
  const mainPage = getMainPageForSession(req);
  mainPage.ClearTransaction();
  res.json({ success: true });
});
// API endpoint to purchase the transaction
app.post('/api/purchase', (req, res) => {
  const mainPage = getMainPageForSession(req);
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
  const mainPage = getMainPageForSession(req);
  let result = mainPage.GetCurrentState();
  res.json(result);
});
// API endpoint to remove an item by index
app.post('/api/remove-item', (req, res) => {
  const { index } = req.body;
  const mainPage = getMainPageForSession(req);
  let result = mainPage.RemoveItemByIndex(index);
  res.json({ success: true, ...result });
});
//API endpoint to customize an order
app.post('/api/customize-order', (req, res) => {
  const { index } = req.body;
  const mainPage = getMainPageForSession(req);
  let result = mainPage.CustomizeOrder(index);
  res.json({ success: true, ...result });
});
// Lightweight health endpoint for tests and readiness checks
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});


// ------------------------------------- Manager API Endpoints Start --------------------------------------
app.post('/api/x-report-data', async (req, res) => {
  try {
    //console.log("request recieved");
    res.json(await manager.XReportData());
  } catch (err) {
    console.error('Error getting data');
    res.json({  hour: -1, sales: -1 });
  }
});

app.get('/api/x-report-data', async (req, res) => {
  try {
    //console.log("request recieved");
    res.json(await manager.XReportData());
  } catch (err) {
    console.error('Error getting data');
    res.json({ hour: -1, sales: -1 });
  }
});

app.get('/api/z-report-data', async (req, res) => {
  try {
    //console.log("request recieved");
    res.json(await manager.ZReportData());
  } catch (err) {
    console.error('Error getting data');
    res.json({ hour: -1, sales: -1 });
  }
});

app.post('/api/sales-report-data', async (req, res) => {
  try {
    //console.log("request recieved");
    const { startTime, endTime } = req.body;
    res.json(await manager.SalesReportData(startTime, endTime));
  } catch (err) {
    console.error('Error getting data' + err);
    res.json({ menuid: -1, name: -1, sales: -1, code: 4096 });
  }
});

app.post('/api/product-usage-report-data', async (req, res) => {
  try {
    //console.log("request recieved");
    const { startTime, endTime } = req.body;
    res.json(await manager.ProductUsageReportData(startTime, endTime));
  } catch (err) {
    console.error('Error getting data' + err);
    res.json({ inventoryid: -1, name: -1, sales: -1, code: 4096 });
  }
});

app.get('/api/restock-report-data', async (req, res) => {
  try {
    //console.log("request recieved");
    res.json(await manager.RestockReportData());
  } catch (err) {
    console.error('Invalid input data');
    res.json({ itemid: -1, name: -1, quantity: -1 });
  }
});

app.get('/api/employee-data', async (req, res) => {
  try {
    //console.log("request recieved");
    res.json(await manager.EmployeeData());
  } catch (err) {
    console.error('Invalid input data');
    res.json({ error: -2 });
  }
});

app.post('/api/add-employee', async (req, res) => {
  try {
    //console.log("request recieved");
    const { employeeId, employeeNewName, employeeRole, employeeWage, employeeIsManager, employeeUsername, employeeEmail, employeePassword } = req.body;
    res.json(await manager.AddEmployee(employeeId, employeeNewName, employeeRole, employeeWage, employeeIsManager, employeeUsername, employeeEmail, employeePassword));
  } catch (err) {
    console.error('Error getting data' + err);
    res.json({ error: -2 });
  }
});

app.post('/api/remove-employee', async (req, res) => {
  try {
   // console.log("request recieved");
    const { employeeId } = req.body;
    res.json(await manager.RemoveEmployee(employeeId));
  } catch (err) {
    console.error('Error getting data' + err);
    res.json({ error: -2 });
  }
});

app.post('/api/update-employee', async (req, res) => {
  try {
   // console.log("request recieved");
    const { employeeId, employeeNewName, employeeRole, employeeWage, employeeIsManager, employeeUsername, employeeEmail, employeePassword } = req.body;
    res.json(await manager.UpdateEmployee(employeeId, employeeNewName, employeeRole, employeeWage, employeeIsManager, employeeUsername, employeeEmail, employeePassword));
  } catch (err) {
    console.error('Error getting data' + err);
    res.json({ error: -2 });
  }
});

app.get('/api/menu-data', async (req, res) => {
  try {
   // console.log("request recieved");
    res.json(await manager.MenuData());
  } catch (err) {
    console.error('Invalid input data');
    res.json({ error: -2 });
  }
});

app.post('/api/add-menu', async (req, res) => {
  try {
   // console.log("request recieved");
    const { menuId, menuName, menuType, menuPriceMod, menuInventoryIds } = req.body;
    res.json(await manager.AddMenu(menuId, menuName, menuType, menuPriceMod, menuInventoryIds));
  } catch (err) {
    console.error('Error getting data' + err);
    res.json({ error: -2 });
  }
});

app.post('/api/remove-menu', async (req, res) => {
  try {
   // console.log("request recieved");
    const { menuId } = req.body;
    res.json(await manager.RemoveMenu(menuId));
  } catch (err) {
    console.error('Error getting data' + err);
    res.json({ error: -2 });
  }
});

app.post('/api/update-menu', async (req, res) => {
  try {
   // console.log("request recieved");
    const { menuId, menuName, menuType, menuPriceMod, menuInventoryIds } = req.body;
    res.json(await manager.UpdateMenu(menuId, menuName, menuType, menuPriceMod, menuInventoryIds));
  } catch (err) {
    console.error('Error getting data' + err);
    res.json({ error: -2 });
  }
});


app.get('/api/inventory-data', async (req, res) => {
  try {
   // console.log("request recieved");
    res.json(await manager.InventoryData());
  } catch (err) {
    console.error('Invalid input data');
    res.json({ error: -2 });
  }
});

app.post('/api/add-inventory', async (req, res) => {
  try {
   // console.log("request recieved");
    const { inventoryId, inventoryItems, inventoryQuantity, inventoryMaxStock, inventoryMinStock } = req.body;
    res.json(await manager.AddInventory(inventoryId, inventoryItems, inventoryQuantity, inventoryMaxStock, inventoryMinStock));
  } catch (err) {
    console.error('Error getting data' + err);
    res.json({ error: -2 });
  }
});

app.post('/api/remove-inventory', async (req, res) => {
  try {
   // console.log("request recieved");
    const { inventoryId } = req.body;
    res.json(await manager.RemoveInventory(inventoryId));
  } catch (err) {
    console.error('Error getting data' + err);
    res.json({ error: -2 });
  }
});

app.post('/api/update-inventory', async (req, res) => {
  try {
   // console.log("request recieved");
    const { inventoryId, inventoryItems, inventoryQuantity, inventoryMaxStock, inventoryMinStock } = req.body;
    res.json(await manager.UpdateInventory(inventoryId, inventoryItems, inventoryQuantity, inventoryMaxStock, inventoryMinStock));
  } catch (err) {
    console.error('Error getting data' + err);
    res.json({ error: -2 });
  }
});



app.get('/api/get-sales-data', async (req, res) => {
  try {
   // console.log("request recieved");
    res.json(await manager.GetSalesData());
  } catch (err) {
    console.error('Invalid input data' + err);
    res.json({ error: -2 });
  }
});

// app.post('/api/update-quantity', async (req, res) => {
//   try {
//     console.log("request recieved");
//     const { inventoryId, inventoryQuantity } = req.body;
//     res.json(await manager.UpdateQuantity(inventoryId, inventoryQuantity));
//   } catch (err) {
//     console.error('Error getting data' + err);
//     res.json({ error: -2 });
//   }
// });
// ------------------------------------- Manager API Endpoints End ------------------------------------


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
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import pkg from "pg";

// dotenv.config();
// const { Pool } = pkg;

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Connect to PostgreSQL
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL || "postgres://user:password@localhost:5432/mydb"
// });

// // Simple route
// app.get("/api/users", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM employees");
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Database query failed" });
//   }
// });

// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
