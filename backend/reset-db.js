import db from './db/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, 'db/schema.sql');
const seedPath = path.join(__dirname, 'db/seed.sql');

async function resetDatabase() {
    try {
        console.log('🌌 INIT_WIPE: Purging all dimensional data...');
        
        // Truncate all tables in correct order or just drop and recreate
        // Dropping and recreating is safer to ensure schema matches
        const schema = fs.readFileSync(schemaPath, 'utf8');
        const seed = fs.readFileSync(seedPath, 'utf8');

        // Drop all tables first
        await db.query(`
            DROP TABLE IF EXISTS poll_votes CASCADE;
            DROP TABLE IF EXISTS poll_options CASCADE;
            DROP TABLE IF EXISTS polls CASCADE;
            DROP TABLE IF EXISTS yearbook_entries CASCADE;
            DROP TABLE IF EXISTS push_subscriptions CASCADE;
            DROP TABLE IF EXISTS bookings CASCADE;
            DROP TABLE IF EXISTS capsules CASCADE;
            DROP TABLE IF EXISTS achievements CASCADE;
            DROP TABLE IF EXISTS availability CASCADE;
            DROP TABLE IF EXISTS conversations CASCADE;
            DROP TABLE IF EXISTS batch_members CASCADE;
            DROP TABLE IF EXISTS batch_groups CASCADE;
            DROP TABLE IF EXISTS alumni_achievements CASCADE;
            DROP TABLE IF EXISTS audit_logs CASCADE;
            DROP TABLE IF EXISTS donations CASCADE;
            DROP TABLE IF EXISTS donation_campaigns CASCADE;
            DROP TABLE IF EXISTS notifications CASCADE;
            DROP TABLE IF EXISTS messages CASCADE;
            DROP TABLE IF EXISTS job_applications CASCADE;
            DROP TABLE IF EXISTS job_postings CASCADE;
            DROP TABLE IF EXISTS event_registrations CASCADE;
            DROP TABLE IF EXISTS events CASCADE;
            DROP TABLE IF EXISTS mentorship_sessions CASCADE;
            DROP TABLE IF EXISTS mentorship_requests CASCADE;
            DROP TABLE IF EXISTS student_profiles CASCADE;
            DROP TABLE IF EXISTS alumni_profiles CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        `);

        console.log('✅ WIPE_COMPLETE: Timeline cleared.');

        console.log('🏗️  REBUILDING: Injecting fresh schema...');
        await db.query(schema);

        console.log('🌱 SEEDING: Injecting fresh entities...');
        await db.query(seed);

        console.log('✨ DIMENSION_RESTORED: Fresh start successful.');
    } catch (err) {
        console.error('❌ RESET_FAILED:', err);
    } finally {
        process.exit();
    }
}

resetDatabase();
