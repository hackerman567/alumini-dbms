import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, 'db/schema.sql');
const seedPath = path.join(__dirname, 'db/seed.sql');

const dbName = process.env.DATABASE_URL.split('/').pop();
const baseUrl = process.env.DATABASE_URL.replace('/' + dbName, '/postgres');

(async () => {
  const adminPool = new Pool({ connectionString: baseUrl });
  try {
    await adminPool.query(`CREATE DATABASE ${dbName}`).catch(e => {
      if (e.code !== '42P04') throw e;
    });
    console.log(`Database ${dbName} confirmed.`);
  } finally {
    await adminPool.end();
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const seed = fs.readFileSync(seedPath, 'utf8');
    await pool.query(schema);
    await pool.query(seed);
    console.log('Database synchronized and seeded with Parallel Universe data.');
  } catch (e) {
    console.error('Seeding failed:', e);
  } finally {
    await pool.end();
  }
})();
