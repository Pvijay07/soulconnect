const io = require('socket.io-client');
const { Client } = require('pg');

const DB = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'V@123', database: 'soul_db' });

async function run() {
    await DB.connect();
    // get a caller and callee
    const callerRes = await DB.query(`SELECT id, phone FROM users WHERE role='user' LIMIT 1`);
    const calleeRes = await DB.query(`SELECT "userId", "voiceRatePerMin" FROM listener_profiles WHERE "isAvailable"=true LIMIT 1`);
    
    if (callerRes.rowCount === 0 || calleeRes.rowCount === 0) {
        console.log('Missing caller or available listener.');
        process.exit();
    }
    
    const caller = callerRes.rows[0];
    const callee = calleeRes.rows[0];
    console.log(`Caller: ${caller.id}, Callee Listener: ${callee.userId}`);

    // fetch raw JWT for both or just invoke DB logic directly to test billing
    // Let's test billing via DB directly invoking the service logic, or through HTTP if we can generate a test token.
    console.log('Testing call deduction logic directly via DB...');
    // check wallet before
    const w1 = await DB.query(`SELECT balance FROM wallets WHERE "userId"=$1`, [caller.id]);
    console.log(`Wallet Balance Before: ₹${w1.rows[0].balance}`);

    // We will simulate the deduction logic that CallsService.endCall does:
    const durationSecs = 125; // 2 mins 5 secs
    const durationMins = durationSecs / 60.0;
    const rate = 5; // standard rate
    const totalBilled = durationMins * rate;
    console.log(`Simulating Call: ${durationSecs} secs @ ₹${rate}/min = ₹${totalBilled}`);

    // deduction
    await DB.query(`UPDATE wallets SET balance = balance - $1 WHERE "userId"=$2`, [totalBilled, caller.id]);
    
    const w2 = await DB.query(`SELECT balance FROM wallets WHERE "userId"=$1`, [caller.id]);
    console.log(`Wallet Balance After: ₹${w2.rows[0].balance}`);

    await DB.end();
}
run();
