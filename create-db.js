const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    user: 'postgres',
    password: 'V@123',
    database: 'postgres',
    port: 5432,
});

client.connect((err) => {
    if (err) {
        console.error('Connection failed:', err.message);
        process.exit(1);
    }

    client.query("CREATE DATABASE soul_db;", (err, res) => {
        if (err) {
            if (err.message.includes('already exists')) {
                console.log('Database already exists.');
            } else {
                console.error('Error creating database:', err.message);
            }
        } else {
            console.log('Database soul_db created successfully.');
        }
        client.end();
    });
});
