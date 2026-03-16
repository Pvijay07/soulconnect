const { Client } = require('pg');
const c = new Client({host:'localhost',port:5432,user:'postgres',password:'V@123',database:'soul_db'});

async function check() {
  await c.connect();
  
  // Check listeners
  const lp = await c.query(`
    SELECT lp."userId", lp.headline, lp."isApproved", lp."isAvailable", lp."approvalStatus", lp.status,
           lp."voiceRatePerMin", lp."expertiseTags", lp."avgRating",
           p."displayName", u.phone, u.role
    FROM listener_profiles lp
    JOIN users u ON u.id = lp."userId"
    LEFT JOIN profiles p ON p."userId" = lp."userId"
  `);
  console.log('=== LISTENER PROFILES ===');
  lp.rows.forEach(r => console.log(JSON.stringify(r)));

  // Count users
  const users = await c.query('SELECT COUNT(*) FROM users');
  console.log('\nTotal users:', users.rows[0].count);

  // Count calls
  const calls = await c.query('SELECT COUNT(*) FROM calls');
  console.log('Total calls:', calls.rows[0].count);

  // Count wallets
  const wallets = await c.query('SELECT COUNT(*) FROM wallets');
  console.log('Total wallets:', wallets.rows[0].count);

  await c.end();
}
check().catch(e => { console.error(e); c.end(); });
