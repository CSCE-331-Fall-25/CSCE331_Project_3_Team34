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

// Connect to PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://user:password@localhost:5432/mydb"
});

// Example: create a test user and main page instance
const user = new User("testUser", "password123", "bob@gmail.com");
const mainPage = new CashierMainPage(user);

// API endpoint to buy an item
app.post('/api/buy-item', (req, res) => {
  let result;
  if (req.body && req.body.itemID) {
    result = mainPage.BuyItemButton(req.body.itemID);
  } else {
    result = mainPage.BuyItemButton();
  }
  res.json({ success: true, ...result });
});

// API endpoint to add a discount
app.post('/api/add-discount', (req, res) => {
  const { discountCode } = req.body;
  let result = { acceptedDiscount: false };
  if (discountCode) {
    result = mainPage.AddDiscount(discountCode);
  }
  // Get the latest discount amount from the transaction
  const state = mainPage.GetCurrentState();
  const success = !!result.acceptedDiscount;
  res.json({ success, acceptedDiscount: result.acceptedDiscount, discountAmount: result.discountAmount || 0 });
});

// API endpoint to clear the transaction
app.post('/api/clear-transaction', (req, res) => {
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
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
