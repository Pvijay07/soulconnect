const { Client } = require('pg');

const passwords = ['V@123'];
let currentIndex = 0;

function tryNextPassword() {
    if (currentIndex >= passwords.length) {
        console.log('Failed to crack password. Please provide the postgres user password.');
        return;
    }

    const pass = passwords[currentIndex];
    const client = new Client({
        host: 'localhost',
        user: 'postgres',
        password: pass,
        database: 'postgres',
        port: 5432,
    });

    client.connect((err) => {
        if (err) {
            // console.log(`Attempt ${pass} failed: ${err.message}`);
            client.end();
            currentIndex++;
            tryNextPassword();
        } else {
            console.log(`SUCCESS: The postgres password is "${pass}"`);
            client.end();
        }
    });
}

tryNextPassword();
