import db from './db/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    try {
        const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'job_applications'");
        console.log("Columns in 'job_applications':", res.rows.map(r => r.column_name));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
