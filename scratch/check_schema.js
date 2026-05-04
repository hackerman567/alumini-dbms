import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkSchema() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'messages';
        `);
        console.log('Messages columns:', res.rows);

        const res2 = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'conversations';
        `);
        console.log('Conversations columns:', res2.rows);

        await pool.end();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
