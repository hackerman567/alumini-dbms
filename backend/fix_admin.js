import db from './db/index.js';
const newHash = '$2b$12$Zvj0sfJrwgvUruYXd3e.MegBJpL5bZ8kg/TM36bjiIn5nT86aNX0G';
const adminEmail = 'admin@alumni.edu';

async function updateAdmin() {
    try {
        await db.query('UPDATE users SET password_hash = $1 WHERE email = $2', [newHash, adminEmail]);
        console.log('✅ Admin password updated successfully.');
    } catch (err) {
        console.error('❌ Update failed:', err);
    } finally {
        process.exit();
    }
}

updateAdmin();
