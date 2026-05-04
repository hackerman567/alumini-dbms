import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function checkSchema() {
    try {
        const alumni = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'alumni_profiles'");
        console.log("ALUMNI PROFILES:");
        console.table(alumni.rows);

        const student = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'student_profiles'");
        console.log("STUDENT PROFILES:");
        console.table(student.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
