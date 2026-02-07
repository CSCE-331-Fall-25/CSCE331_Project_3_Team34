import "dotenv/config";
import { pool } from "./db.js";

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log("Successfully connected to database!");
        const res = await client.query('SELECT current_database()');
        console.log("Connected to database:", res.rows[0].current_database);
        client.release();
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err);
        process.exit(1);
    }
}

testConnection();
