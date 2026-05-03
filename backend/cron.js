import cron from 'node-cron';
import db from './db/index.js';
import { broadcast } from './utils/broadcast.js';

export const startCronJobs = () => {
    // Run every midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        console.log('⏳ Running Midnight Cron: Checking Time Capsules...');
        try {
            // Find capsules that should be revealed today
            const result = await db.query(`
                UPDATE capsules 
                SET is_revealed = true 
                WHERE is_revealed = false AND unlock_date <= NOW() 
                RETURNING id, title, author_id
            `);

            if (result.rows.length > 0) {
                console.log(`🔓 Unsealed ${result.rows.length} Time Capsules!`);
                
                // Broadcast that capsules have been revealed
                broadcast('live_event', {
                    type: 'capsule',
                    message: `◈ DIMENSION RIFT: ${result.rows.length} Time Capsules have just unsealed in the Vault!`,
                    time: new Date()
                });
            }
        } catch (err) {
            console.error('Error in capsule cron job:', err);
        }
    });

    console.log('🕰️  Cron Jobs Initialized.');
};
