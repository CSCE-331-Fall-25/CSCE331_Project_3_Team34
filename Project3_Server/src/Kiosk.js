import express from 'express';

import Transaction, {Order, Tray} from './Transaction.js';
import Item, {Menu} from './Item.js';
import User, {Employee, Customer} from './User.js';
import { pool } from './db.js';

const kioskRouter = express.Router();
let nextTransactionNum = -1;
let nextOrderNum = -1;

kioskRouter.get('/get-next-transaction-number', async (req, res) => {
    try {
        const result = await pool.query("SELECT transactionid, orderid FROM orders ORDER BY orderid DESC LIMIT 1");
        nextTransactionNum = 1 + result.rows[0].transactionid;
        nextOrderNum = 1 + result.rows[0].orderid;
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database query failed" });
    }
});

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
        const now = new Date();
        const { orderData, customerid } = req.body;
        if (!orderData) {
            return res.status(400).json({ error: "Missing order data" });
        }
        let result = '';
        let price = 0;
        for (const row of orderData) {
            console.log(row);
            if (row.price) {
                price += row.price;
                console.log(nextTransactionNum + "   " + row.itemid + "   " + nextOrderNum);
                await pool.query("INSERT INTO orders (transactionid, itemid, orderid) VALUES ($1, $2, $3)", [nextTransactionNum, row.itemid, nextOrderNum]);
                nextOrderNum++;
            }
            else {
                price += row.pricemod;
                console.log(nextOrderNum + "   " + row.menuid + "   " + row.type + "    medium");
                await pool.query("INSERT INTO trays (orderid, menuid, type, size) VALUES ($1, $2, $3, $4)", [nextOrderNum, row.menuid, row.type, "medium"]);
            }
        }
        console.log(nextTransactionNum + "   -1   " + now.toISOString().slice(0, 19).replace('T', ' ') + "   " + price + "   " + (price * .27).toFixed(2) + "    " + customerid + "   4");
        let timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
        if (Number(timestamp.substring(11, 13)) < 6) {
            timestamp = timestamp.substring(0, 11) + String(Number(timestamp.substring(11, 13)) + 18) + timestamp.substring(13, 19);
        }
        else {
            if (String(Number(timestamp.substring(11, 13)) - 6).length == 1) {
                timestamp = timestamp.substring(0, 11) + "0" + String(Number(timestamp.substring(11, 13)) - 6) + timestamp.substring(13, 19);
            }
            else {
                timestamp = timestamp.substring(0, 11) + String(Number(timestamp.substring(11, 13)) - 6) + timestamp.substring(13, 19);
            }
        }
        const query = `INSERT INTO transactions (transactionid, employeeid, time, amount, profit, customerid, stage) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
        const values = [nextTransactionNum, -1, timestamp, price, (price * .27).toFixed(2), customerid, 4];
        result = await pool.query(query, values);
        console.log("We did it");
        nextTransactionNum++;
        res.json({ success: true });

    } catch(err) {
        console.log("We didn't do it");
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