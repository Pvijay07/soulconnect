const { Client } = require('pg');
(async () => {
    const DB = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'V@123', database: 'soul_db' });
    await DB.connect();
    const res = await DB.query('SELECT u.id, u.phone, lp."isAvailable", lp.status FROM users u JOIN listener_profiles lp ON lp."userId" = u.id');
    console.log(JSON.stringify(res.rows, null, 2));
    await DB.end();
})();
