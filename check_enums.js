const { Client } = require('pg');
const DB = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'V@123', database: 'soul_db' });

async function run() {
  await DB.connect();
  
  // Check enum types
  const enumRes = await DB.query(`
    SELECT t.typname, e.enumlabel 
    FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid 
    ORDER BY t.typname, e.enumsortorder
  `);
  
  const grouped = {};
  for (const row of enumRes.rows) {
    if (!grouped[row.typname]) grouped[row.typname] = [];
    grouped[row.typname].push(row.enumlabel);
  }
  
  for (const [name, vals] of Object.entries(grouped)) {
    console.log(`${name}: ${vals.join(', ')}`);
  }
  
  await DB.end();
}
run().catch(e => { console.error(e.message); DB.end(); });
