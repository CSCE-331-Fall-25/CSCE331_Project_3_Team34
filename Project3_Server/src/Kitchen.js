import express from 'express';
import { pool } from './db.js';

const kitchenRouter = express.Router();

kitchenRouter.get('/get-not-started', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        // Fetch transactions with their items
        const transactionsResult = await pool.query(
            'SELECT * FROM transactions WHERE stage = 4 ORDER BY time ASC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        
        // Enrich each transaction with its items
        const enrichedTransactions = await Promise.all(
            transactionsResult.rows.map(async (transaction) => {
                const itemsResult = await pool.query(`
                    SELECT i.name 
                    FROM orders o
                    JOIN items i ON o.itemid = i.itemid
                    WHERE o.transactionid = $1
                `, [transaction.transactionid]);
                
                return {
                    ...transaction,
                    items: itemsResult.rows.map(row => row.name)
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
            'SELECT * FROM transactions WHERE stage = 3 ORDER BY time ASC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        
        // Enrich each transaction with its items
        const enrichedTransactions = await Promise.all(
            transactionsResult.rows.map(async (transaction) => {
                const itemsResult = await pool.query(`
                    SELECT i.name 
                    FROM orders o
                    JOIN items i ON o.itemid = i.itemid
                    WHERE o.transactionid = $1
                `, [transaction.transactionid]);
                
                return {
                    ...transaction,
                    items: itemsResult.rows.map(row => row.name)
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
            'SELECT * FROM transactions WHERE stage = 2 ORDER BY time ASC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        
        // Enrich each transaction with its items
        const enrichedTransactions = await Promise.all(
            transactionsResult.rows.map(async (transaction) => {
                const itemsResult = await pool.query(`
                    SELECT i.name 
                    FROM orders o
                    JOIN items i ON o.itemid = i.itemid
                    WHERE o.transactionid = $1
                `, [transaction.transactionid]);
                
                return {
                    ...transaction,
                    items: itemsResult.rows.map(row => row.name)
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