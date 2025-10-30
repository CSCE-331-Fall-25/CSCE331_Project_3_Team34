import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import { CashierMainPage, User } from "./MainPage.js";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Connect to PostgreSQL (assignable so tests can inject a mock)
// Create a Postgres pool if we can. Use DATABASE_URL from environment (.env) with a standard
// postgres://user:pass@host:port/dbname format. If connection fails (wrong creds or network)
// we log a clear message and continue with `pool = null` so the server doesn't crash.
let pool = null;
const connectionString = process.env.DATABASE_URL || "postgres://team_34:bobross@csce-315-db.engr.tamu.edu:5432/team_34_db";

try {
  // Attempt to create a pool and run a quick test query. Use top-level await semantics.
  pool = new Pool({ connectionString });
  await pool.query('SELECT 1');
  console.log('Connected to Postgres');
} catch (pgErr) {
  console.error('Postgres connection failed — DB will be disabled for this run.');
  // Log succinct error to help debugging (avoid printing secrets)
  console.error(pgErr && pgErr.message ? pgErr.message : pgErr);
  pool = null;
}

// Allow tests or runtime code to inject a mock pool
export function setPool(newPool) {
  pool = newPool;
  if (typeof mainPage !== 'undefined' && mainPage && typeof mainPage.setDB === 'function') {
    mainPage.setDB(newPool);
  }
}

// Example: create a test user and main page instance (pass the pool so it has DB access)
const user = new User("testUser", "password123", "bob@gmail.com");
const mainPage = new CashierMainPage(user, pool);

// API endpoint to buy an item
app.post('/api/buy-item', async (req, res) => {
  try {
    let result;
    if (req.body && req.body.itemID) {
      result = await mainPage.BuyItemButton(req.body.itemID);
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
      success: result.acceptedDiscount === true,
      acceptedDiscount: result.acceptedDiscount === true,
      discountPer: result.discountPer || 0,
      priceOff: result.priceOff || 0
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

// Lightweight health endpoint for tests and readiness checks
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

import path from "path";
import { fileURLToPath } from "url";

// Get absolute directory path (needed since we’re in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve React build folder (adjust if you used CRA instead of Vite)
app.use(express.static(path.join(__dirname, "../../Project3_Client/dist")));

// ✅ For any non-API route, serve index.html so React handles client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Project3_Client/dist/index.html"));
});

const PORT = process.env.PORT || 5000;
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

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));