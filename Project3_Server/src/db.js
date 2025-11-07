import pkg from "pg";

const { Pool } = pkg;

// Connect to PostgreSQL (assignable so tests can inject a mock)
// Create a Postgres pool if we can. Use DATABASE_URL from environment (.env) with a standard
// postgres://user:pass@host:port/dbname format. If connection fails (wrong creds or network)
// we log a clear message and continue with `pool = null` so the server doesn't crash.
const connectionString = process.env.DATABASE_URL || "postgres://team_34:bobross@csce-315-db.engr.tamu.edu:5432/team_34_db";

export const pool = new Pool({
    connectionString: connectionString
});

// Allow tests or runtime code to inject a mock pool
export function setPool(newPool) {
  pool = newPool;
  if (typeof mainPage !== 'undefined' && mainPage && typeof mainPage.setDB === 'function') {
    mainPage.setDB(newPool);
  }
}
