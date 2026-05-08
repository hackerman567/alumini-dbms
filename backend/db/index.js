import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database Connection Error:', err.stack);
    } else {
        console.log('✅ PostgreSQL Connected at:', res.rows[0].now);
    }
});

export default {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
    pool: pool
};

