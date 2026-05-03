import db from './db/index.js';

const users = [
    { email: 'admin@alumni.edu', hash: '$2b$12$Zvj0sfJrwgvUruYXd3e.MegBJpL5bZ8kg/TM36bjiIn5nT86aNX0G' }, // Admin@123
    { email: 'faculty@alumni.edu', hash: '$2b$12$JXMnRwmqxn4jrTnBB8H7V.2oGFHODQGjHS0ot.fB4dCxwzTrLODqe' }, // Faculty@123
    { email: 'sarah.j@techcorp.com', hash: '$2b$12$qrbMtoVBA1oYll/gp3Sr6.rGwbCE5vv/Wka5etm4MwiThvpWCahjm' }, // Alumni@123
    { email: 'alice@student.edu', hash: '$2b$12$RxNU.iJnm7c6PpdGKiKjmuOX6oschG1/t/whRKw6L9o./0fzRuCXS' }, // Student@123
];

async function fixAll() {
    try {
        for (const user of users) {
            await db.query('UPDATE users SET password_hash = $1 WHERE email = $2', [user.hash, user.email]);
            console.log(`✅ Updated ${user.email}`);
        }
    } catch (err) {
        console.error('❌ Update failed:', err);
    } finally {
        process.exit();
    }
}

fixAll();
