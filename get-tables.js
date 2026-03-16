const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    user: 'postgres',
    password: 'V@123',
    database: 'soul_db',
    port: 5432,
});

async function getTables() {
    await client.connect();
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
    console.log('--- DATABASE TABLES ---');
    res.rows.forEach(r => console.log('- ' + r.table_name));
    await client.end();
}

getTables().catch(console.error);
