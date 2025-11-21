import express from 'express';

import Transaction, {Order, Tray} from './Transaction.js';
import Item, {Menu} from './Item.js';
import User, {Employee, Customer} from './User.js';
import { pool } from './db.js';

const kioskRouter = express.Router();

kioskRouter.get('/get-items', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM items");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database query failed" });
    }
});

kioskRouter.get('/get-menu', async (req, res) => {
    try {
        const { type } = req.query;
        const result = type
        ? await pool.query('SELECT * FROM menu WHERE LOWER(type) = LOWER($1)', [type])
        : await pool.query('SELECT * FROM menu');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query failed' });
    }
});

kioskRouter.get('/get-sizes', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM sizemods");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database query failed" });
    }
});

kioskRouter.post('/submit-order', async (req, res) => {
    try {
        const { orderData } = req.body;
        if (!orderData) {
            return res.status(400).json({ error: "Missing order data" });
        }
        // handle stuff here tyler
        res.json({ success: true });

    } catch(err) {
        console.error(err);
        res.status(500).json({ error: "Failed to process order" });
    }
});

export default kioskRouter;

export class Kiosk {
    constructor() {
        this.transaction = new Transaction();
        this.menu = new Menu();
        this.user = new User();
    }
}