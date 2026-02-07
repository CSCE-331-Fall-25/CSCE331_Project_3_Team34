import pkg from "pg";

const { Pool } = pkg;

// Connect to PostgreSQL
// In production (Render), DATABASE_URL is provided as an environment variable
// For local development, falls back to the default connection string
const connectionString = process.env.DATABASE_URL || "postgres://team_34:bobross@csce-315-db.engr.tamu.edu:5432/team_34_db";

export const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

// Allow tests or runtime code to inject a mock pool
export function setPool(newPool) {
  pool = newPool;
  if (typeof mainPage !== 'undefined' && mainPage && typeof mainPage.setDB === 'function') {
    mainPage.setDB(newPool);
  }
}
