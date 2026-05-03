import db from './db/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    try {
        const res1 = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'alumni_profiles'");
        console.log("Columns in 'alumni_profiles':", res1.rows.map(r => r.column_name));
        const res2 = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'student_profiles'");
        console.log("Columns in 'student_profiles':", res2.rows.map(r => r.column_name));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
