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
        let transIdRes = await pool.query('SELECT transactionid FROM transactions ORDER BY transactionid DESC');
        if (!transIdRes || !transIdRes.rows || transIdRes.rows.length === 0) {
            throw new Error('Failed to retrieve next transaction ID');
        }
        nextTransactionNum = transIdRes.rows[0].transactionid + 1;
        console.log(nextTransactionNum +"wgeergttwrg5te");
        transIdRes = await pool.query('SELECT orderid FROM orders ORDER BY orderid DESC');
        if (!transIdRes || !transIdRes.rows || transIdRes.rows.length === 0) {
            throw new Error('Failed to retrieve next order ID');
        }
        nextOrderNum = transIdRes.rows[1].orderid;
        const orderData = req.body.orderItems;
        if (!orderData) {
            return res.status(400).json({ error: "Missing order data" });
        }
        let result = '';
        let price = 0;
        let family = false;
        for (const row of orderData) {
            console.log(row);
            if (row.price) {
                price += row.price;
                nextOrderNum++;
                console.log(nextTransactionNum + "   " + row.itemid + "   " + nextOrderNum);
                await pool.query("INSERT INTO orders (transactionid, itemid, orderid) VALUES ($1, $2, $3)", [nextTransactionNum, row.itemid, nextOrderNum]);
                await pool.query("UPDATE inventory AS i SET quantity = i.quantity - 1 FROM items AS it WHERE i.inventoryid = ANY(it.inventoryids) AND it.itemid = " + row.itemid + ";");
                if (row.itemid == 4) {
                    family = true;
                }
                else {
                    family = false;
                }
            }
            else {
                price += row.pricemod;
                console.log(nextOrderNum + "   " + row.menuid + "   " + row.type + "    small");
                if (row.sizeKey == "large" || family) {
                    await pool.query("UPDATE inventory AS i SET quantity = i.quantity - 3 FROM menu AS m WHERE i.inventoryid = ANY(m.inventoryids) AND m.menuid = " + row.menuid + ";");
                    await pool.query("INSERT INTO trays (orderid, menuid, type, size) VALUES ($1, $2, $3, $4)", [nextOrderNum, row.menuid, row.type, "large"]);
                }
                else if (row.sizeKey == "medium") {
                    await pool.query("UPDATE inventory AS i SET quantity = i.quantity - 2 FROM menu AS m WHERE i.inventoryid = ANY(m.inventoryids) AND m.menuid = " + row.menuid + ";");
                    await pool.query("INSERT INTO trays (orderid, menuid, type, size) VALUES ($1, $2, $3, $4)", [nextOrderNum, row.menuid, row.type, "medium"]);
                }
                else {
                    await pool.query("UPDATE inventory AS i SET quantity = i.quantity - 1 FROM menu AS m WHERE i.inventoryid = ANY(m.inventoryids) AND m.menuid = " + row.menuid + ";");
                    await pool.query("INSERT INTO trays (orderid, menuid, type, size) VALUES ($1, $2, $3, $4)", [nextOrderNum, row.menuid, row.type, "small"]);
                }
            }
        }
        console.log(nextTransactionNum + "   -1   " + now.toISOString().slice(0, 19).replace('T', ' ') + "   " + price + "   " + (price * .27).toFixed(2) + "    " + "   4");
        let timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
        // if (Number(timestamp.substring(11, 13)) < 6) {
        //     timestamp = timestamp.substring(0, 11) + String(Number(timestamp.substring(11, 13)) + 18) + timestamp.substring(13, 19);
        // }
        // else {
        //     if (String(Number(timestamp.substring(11, 13)) - 6).length == 1) {
        //         timestamp = timestamp.substring(0, 11) + "0" + String(Number(timestamp.substring(11, 13)) - 6) + timestamp.substring(13, 19);
        //     }
        //     else {
        //         timestamp = timestamp.substring(0, 11) + String(Number(timestamp.substring(11, 13)) - 6) + timestamp.substring(13, 19);
        //     }
        // }
        const query = `INSERT INTO transactions (transactionid, employeeid, time, amount, profit, customerid, stage) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
        const values = [nextTransactionNum, -1, timestamp, price, (price * .27).toFixed(2), -1, 4];
        result = await pool.query(query, values);
        console.log("We did it");
        nextTransactionNum++;
        res.json({ transactionid: nextTransactionNum - 1 });

    } catch(err) {
        console.log("We didn't do it");
        console.error(err);
        res.status(500).json({ error: "Failed to process order" });
    }
});

export default kioskRouter;
