const { Client } = require('pg');
const DB = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'V@123', database: 'soul_db' });

async function run() {
  await DB.connect();

  // List all tables
  const tablesRes = await DB.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`);
  console.log('=== ALL TABLES ===');
  tablesRes.rows.forEach(r => console.log(r.table_name));

  await DB.end();
}
run().catch(e => { console.error('ERROR:', e.message); });
