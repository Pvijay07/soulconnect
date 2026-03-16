const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    user: 'postgres',
    password: 'V@123',
    database: 'soul_db',
    port: 5432,
});

async function checkRecentData() {
    try {
        await client.connect();
        console.log('--- RECENT USERS ---');
        const users = await client.query('SELECT id, phone, "createdAt" FROM users ORDER BY "createdAt" DESC LIMIT 5;');
        console.table(users.rows);

        console.log('\n--- RECENT TRANSACTIONS ---');
        const tx = await client.query('SELECT * FROM transactions ORDER BY "createdAt" DESC LIMIT 5;');
        console.table(tx.rows);

        console.log('\n--- RECENT CALLS ---');
        const calls = await client.query('SELECT * FROM calls ORDER BY "createdAt" DESC LIMIT 5;');
        console.table(calls.rows);

    } catch (err) {
        console.error('Error checking DB:', err.message);
    } finally {
        await client.end();
    }
}

checkRecentData();
