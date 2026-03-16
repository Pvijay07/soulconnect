const { Client } = require('pg');
const c = new Client({host:'localhost',port:5432,user:'postgres',password:'V@123',database:'soul_db'});
c.connect()
  .then(()=>c.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"))
  .then(r=>console.log(JSON.stringify(r.rows.map(x=>x.table_name))))
  .catch(e=>console.error(e.message))
  .finally(()=>c.end());
