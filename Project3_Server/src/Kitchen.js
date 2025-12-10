import express from 'express';
import { pool } from './db.js';

const kitchenRouter = express.Router();

async function buildTraySummaries(transactionId) {
    const trayRows = await pool.query(
        `SELECT trays.orderid,
                items.name AS tray_type,
                trays.type AS tray_catagory,
                menu.name AS menu_item,
                trays.size AS tray_size
         FROM orders
         JOIN trays ON orders.orderid = trays.orderid
         JOIN items ON orders.itemid = items.itemid
         JOIN menu ON trays.menuid = menu.menuid
         WHERE orders.transactionid = $1
         ORDER BY trays.orderid, menu.name`,
        [transactionId]
    );
    const grouped = trayRows.rows.reduce((acc, row) => {
        const key = `${row.orderid}-${row.tray_type}-${row.tray_size ?? ''}`;
        if (!acc[key]) {
            acc[key] = {
                orderId: row.orderid,
                trayType: row.tray_type,
                trayCatagory: row.tray_catagory,
                traySize: row.tray_size,
                // store menu items as objects so we can keep per-item category
                menuItems: [],
            };
        }
        acc[key].menuItems.push({ name: row.menu_item, catagory: row.tray_catagory });
        return acc;
    }, {});

    return Object.values(grouped).map(tray => {
        // Build lines from menu item names (client will decode/translate)
        const itemLines = tray.menuItems.map(mi => `- ${mi.name}`).join('\n');
        const sizeLabel = tray.traySize ? ` (${tray.traySize})` : '';

        // count how many menu items in this tray have category 'side'
        const sideCount = (tray.menuItems || []).filter(mi => mi?.catagory && mi.catagory.toLowerCase() === 'side').length;

        // const variable: set to "Half & Half" when there are at least two
        // side items in this tray and the tray type isn't 'Family'
        const halfAndHalfLabel = (sideCount >= 2 && !(tray.trayType && tray.trayType.toLowerCase() === 'family'))
            ? 'Half & Half'
            : '';

        return `${tray.trayType}${sizeLabel}${halfAndHalfLabel ? ` (${halfAndHalfLabel})` : ''}:\n${itemLines}`;
    });
}

kitchenRouter.get('/get-not-started', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        // Fetch transactions with their items
        const transactionsResult = await pool.query(
            'SELECT transactionid, time, stage FROM transactions WHERE stage = 4 ORDER BY time ASC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        
        // Enrich each transaction with its items
        const enrichedTransactions = await Promise.all(
            transactionsResult.rows.map(async (transaction) => {
                return {
                    ...transaction,
                    items: await buildTraySummaries(transaction.transactionid),
                };
            })
        );
        
        res.json(enrichedTransactions);
    } catch (err) {
        console.error('Error fetching not started transactions:', err);
        res.status(500).json({ error: 'Failed to fetch not started transactions' });
    }
});

kitchenRouter.get('/get-in-progress', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        // Fetch transactions with their items
        const transactionsResult = await pool.query(
            'SELECT transactionid, time, stage FROM transactions WHERE stage = 3 ORDER BY time ASC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        
        // Enrich each transaction with its items
        const enrichedTransactions = await Promise.all(
            transactionsResult.rows.map(async (transaction) => {
                return {
                    ...transaction,
                    items: await buildTraySummaries(transaction.transactionid),
                };
            })
        );
        
        res.json(enrichedTransactions);
    } catch (err) {
        console.error('Error fetching in-progress transactions:', err);
        res.status(500).json({ error: 'Failed to fetch in-progress transactions' });
    }
});

kitchenRouter.get('/get-completed', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        // Fetch transactions with their items
        const transactionsResult = await pool.query(
            'SELECT transactionid, time, stage FROM transactions WHERE stage = 2 ORDER BY time ASC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        
        // Enrich each transaction with its items
        const enrichedTransactions = await Promise.all(
            transactionsResult.rows.map(async (transaction) => {
                return {
                    ...transaction,
                    items: await buildTraySummaries(transaction.transactionid),
                };
            })
        );
        
        res.json(enrichedTransactions);
    } catch (err) {
        console.error('Error fetching completed transactions:', err);
        res.status(500).json({ error: 'Failed to fetch completed transactions' });
    }
});

kitchenRouter.post('/update-stage', async (req, res) => {
    try {
        const { transactionID } = req.body;
        if (!transactionID) {
            return res.status(400).json({ error: 'Missing transaction ID' });
        }
        const q = 'UPDATE transactions SET stage = stage - 1 WHERE transactionid = $1';
        await pool.query(q, [transactionID]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating transaction stage:', err);
        res.status(500).json({ error: 'Failed to update transaction stage' });
    }
});

kitchenRouter.post('/revert-stage', async (req, res) => {
    try {
        const { transactionID } = req.body;
        if (!transactionID) {
            return res.status(400).json({ error: 'Missing transaction ID' });
        }
        const q = 'UPDATE transactions SET stage = stage + 1 WHERE transactionid = $1';
        await pool.query(q, [transactionID]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error reverting transaction stage:', err);
        res.status(500).json({ error: 'Failed to revert transaction stage' });
    }
});

export default kitchenRouter;