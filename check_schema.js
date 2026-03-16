const { Client } = require('pg');
const DB = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'V@123', database: 'soul_db' });

async function run() {
  await DB.connect();
  
  // Check banner columns
  const colsRes = await DB.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='banners' ORDER BY ordinal_position`);
  console.log('banners columns:', colsRes.rows.map(r => `${r.column_name}(${r.data_type})`).join(', '));

  // Check calls columns
  const callColsRes = await DB.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='calls' ORDER BY ordinal_position`);
  console.log('calls columns:', callColsRes.rows.map(r => `${r.column_name}`).join(', '));

  // Check listener_profiles columns
  const lpColsRes = await DB.query(`SELECT column_name FROM information_schema.columns WHERE table_name='listener_profiles' ORDER BY ordinal_position`);
  console.log('listener_profiles columns:', lpColsRes.rows.map(r => r.column_name).join(', '));

  // Check profiles columns
  const pColsRes = await DB.query(`SELECT column_name FROM information_schema.columns WHERE table_name='profiles' ORDER BY ordinal_position`);
  console.log('profiles columns:', pColsRes.rows.map(r => r.column_name).join(', '));

  // Sample banner data if any
  const bannerSample = await DB.query(`SELECT * FROM banners LIMIT 1`);
  console.log('banner sample:', JSON.stringify(bannerSample.rows[0]));
  
  await DB.end();
}
run().catch(e => { console.error(e.message); DB.end(); });
