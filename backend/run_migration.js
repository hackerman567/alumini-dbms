import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    try {
        console.log('Starting addon features migration...');
        const sqlPath = path.join(__dirname, 'db', '1_addon_features.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        await db.query(sql);
        console.log('✅ Migration successful! Addon tables created.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
