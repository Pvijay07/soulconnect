const { Client } = require('pg');
const client = new Client({
    host: 'localhost',
    user: 'postgres',
    password: 'soulconnect_pass',
    database: 'soul_db',
    port: 5432,
});

client.connect((err) => {
    if (err) {
        console.log('Connection Default Failed:', err.message);
        const client2 = new Client({
            host: 'localhost',
            user: 'postgres',
            password: 'soulconnect_pass',
            database: 'postgres',
            port: 5432,
        });
        client2.connect((err2) => {
            if (err2) {
                console.log('Connection Postgres Failed:', err2.message);
            } else {
                console.log('Connected to postgres database successfully!');
                client2.end();
            }
        });
    } else {
        console.log('Connected to soul_db successfully!');
        client.end();
    }
});
