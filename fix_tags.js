const { Client } = require('pg');
const c = new Client({host:'localhost',port:5432,user:'postgres',password:'V@123',database:'soul_db'});

async function fix() {
  await c.connect();
  
  // Fix expertiseTags for new listeners (stored as JSON string, should be comma-separated for simple-array)
  const lps = await c.query(`SELECT id, "expertiseTags" FROM listener_profiles WHERE "expertiseTags" LIKE '[%'`);
  
  for (const lp of lps.rows) {
    try {
      const tags = JSON.parse(lp.expertiseTags);
      const commaSeparated = tags.join(',');
      await c.query(`UPDATE listener_profiles SET "expertiseTags" = $1 WHERE id = $2`, [commaSeparated, lp.id]);
      console.log(`Fixed: ${lp.expertiseTags} -> ${commaSeparated}`);
    } catch(e) {
      console.log(`Skipping ${lp.id}: ${e.message}`);
    }
  }
  
  // Also fix languages
  const langs = await c.query(`SELECT id, languages FROM listener_profiles WHERE languages LIKE '[%'`);
  for (const l of langs.rows) {
    try {
      const parsed = JSON.parse(l.languages);
      const commaSeparated = parsed.join(',');
      await c.query(`UPDATE listener_profiles SET languages = $1 WHERE id = $2`, [commaSeparated, l.id]);
      console.log(`Fixed languages: ${l.languages} -> ${commaSeparated}`);
    } catch(e) {
      console.log(`Skipping: ${e.message}`);
    }
  }

  console.log('✅ Fixed all tag formats');
  await c.end();
}

fix().catch(e => { console.error(e); c.end(); });
