/**
 * End-to-end call flow test via Socket.IO
 * Tests: socket connect, call:initiate, call:incoming, call:accept, call:signal, call:end
 */
const { Client } = require('pg');
const http = require('http');
const io = require('socket.io-client');

const DB = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'V@123', database: 'soul_db' });

function httpPost(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost', port: 3000, path, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
    const req = http.request(options, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, raw }); }
      });
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  await DB.connect();
  console.log('✅ DB Connected');

  // 1. Get a caller (user role) and a callee (listener role)
  const callerRow = await DB.query(`SELECT id, phone FROM users WHERE role='user' AND phone IS NOT NULL LIMIT 1`);
  const calleeRow = await DB.query(`
    SELECT u.id, u.phone FROM users u 
    JOIN listener_profiles lp ON lp."userId" = u.id 
    WHERE lp."isApproved" = true 
    LIMIT 1
  `);

  if (callerRow.rowCount === 0 || calleeRow.rowCount === 0) {
    console.log('❌ Need at least one user and one approved listener in DB');
    await DB.end(); return;
  }

  const caller = callerRow.rows[0];
  const callee = calleeRow.rows[0];
  console.log(`Caller: ${caller.id} (${caller.phone})`);
  console.log(`Callee: ${callee.id} (${callee.phone})`);

  // Ensure listener is available
  await DB.query(`UPDATE listener_profiles SET "isAvailable"=true, status='online' WHERE "userId"=$1`, [callee.id]);
  // Ensure caller has enough balance
  await DB.query(`UPDATE wallets SET balance=100 WHERE "userId"=$1`, [caller.id]);
  console.log('✅ Set listener available & caller balance=100');

  // 2. Get auth tokens for both users via OTP
  const sendOtpCaller = await httpPost('/api/auth/otp/send', { phone: caller.phone });
  console.log(`Caller OTP send: ${sendOtpCaller.status}`);
  const verifyCaller = await httpPost('/api/auth/otp/verify', { phone: caller.phone, otp: '123456' });
  if (!verifyCaller.data?.data?.accessToken) {
    console.log('❌ Caller auth failed:', JSON.stringify(verifyCaller.data));
    await DB.end(); return;
  }
  const callerToken = verifyCaller.data.data.accessToken;
  console.log('✅ Caller authenticated');

  const sendOtpCallee = await httpPost('/api/auth/otp/send', { phone: callee.phone });
  console.log(`Callee OTP send: ${sendOtpCallee.status}`);
  const verifyCallee = await httpPost('/api/auth/otp/verify', { phone: callee.phone, otp: '123456' });
  if (!verifyCallee.data?.data?.accessToken) {
    console.log('❌ Callee auth failed:', JSON.stringify(verifyCallee.data));
    await DB.end(); return;
  }
  const calleeToken = verifyCallee.data.data.accessToken;
  console.log('✅ Callee authenticated');

  // 3. Connect both to calls socket
  console.log('\n--- SOCKET CONNECTION ---');
  
  const callerSocket = io('http://localhost:3000/calls', {
    transports: ['websocket'],
    auth: { token: callerToken },
  });
  
  const calleeSocket = io('http://localhost:3000/calls', {
    transports: ['websocket'],
    auth: { token: calleeToken },
  });

  await new Promise((resolve) => {
    let connected = 0;
    callerSocket.on('connect', () => { console.log('✅ Caller socket connected'); connected++; if (connected === 2) resolve(); });
    calleeSocket.on('connect', () => { console.log('✅ Callee socket connected'); connected++; if (connected === 2) resolve(); });
    callerSocket.on('connect_error', (e) => { console.log('❌ Caller socket error:', e.message); });
    calleeSocket.on('connect_error', (e) => { console.log('❌ Callee socket error:', e.message); });
    setTimeout(() => { if (connected < 2) { console.log(`❌ Only ${connected}/2 sockets connected after 5s`); resolve(); } }, 5000);
  });

  // 4. Setup callee to listen for incoming call
  console.log('\n--- CALL FLOW ---');
  
  let receivedCallId = null;
  let receivedOffer = null;
  let receivedCallerId = null;

  calleeSocket.on('call:incoming', (data) => {
    console.log('✅ Callee received call:incoming!');
    console.log('   callId:', data.callId);
    console.log('   callerId:', data.callerId);
    console.log('   type:', data.type);
    console.log('   offer present:', !!data.offer);
    receivedCallId = data.callId;
    receivedOffer = data.offer;
    receivedCallerId = data.callerId;
  });

  callerSocket.on('call:accepted', (data) => {
    console.log('✅ Caller received call:accepted!');
    console.log('   callId:', data.callId);
    console.log('   answer present:', !!data.answer);
  });

  callerSocket.on('call:signal', (data) => {
    console.log('✅ Caller received call:signal from callee');
  });

  calleeSocket.on('call:signal', (data) => {
    console.log('✅ Callee received call:signal from caller');
  });

  callerSocket.on('wallet:update', (data) => {
    console.log('💰 Caller wallet update:', data.balance);
  });

  callerSocket.on('call:ended', (data) => {
    console.log('📞 Caller received call:ended');
  });

  calleeSocket.on('call:ended', (data) => {
    console.log('📞 Callee received call:ended');
  });

  // 5. Caller initiates call
  console.log('Caller emitting call:initiate...');
  
  // Test with emitWithAck
  const fakeOffer = { sdp: 'v=0\r\no=- 12345 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\na=rtpmap:111 opus/48000/2\r\n', type: 'offer' };
  
  callerSocket.emit('call:initiate', {
    calleeId: callee.id,
    type: 'voice',
    offer: fakeOffer,
  }, (ackData) => {
    console.log('✅ Caller received ACK from call:initiate:', JSON.stringify(ackData));
  });

  // Wait for callee to receive the incoming call
  await sleep(3000);

  if (!receivedCallId) {
    console.log('❌ Callee NEVER received call:incoming after 3 seconds!');
    console.log('   This means the signaling is broken.');
    callerSocket.disconnect();
    calleeSocket.disconnect();
    await DB.end();
    return;
  }

  // 6. Callee accepts the call
  console.log('Callee emitting call:accept...');
  const fakeAnswer = { sdp: 'v=0\r\no=- 12345 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\na=rtpmap:111 opus/48000/2\r\n', type: 'answer' };
  
  calleeSocket.emit('call:accept', {
    callId: receivedCallId,
    answer: fakeAnswer,
  });

  await sleep(2000);

  // 7. Test ICE signal relay
  console.log('Testing ICE signal relay...');
  callerSocket.emit('call:signal', {
    recipientId: callee.id,
    signal: { candidate: 'candidate:1 1 UDP 2122252543 10.0.0.1 50000 typ host', sdpMid: '0', sdpMLineIndex: 0 },
  });

  await sleep(1000);

  // 8. Check call state in DB
  const callCheck = await DB.query(`SELECT id, status, "ratePerMin", "connectedAt" FROM calls WHERE id=$1`, [receivedCallId]);
  if (callCheck.rowCount > 0) {
    const c = callCheck.rows[0];
    console.log(`\n--- CALL DB STATE ---`);
    console.log(`  id: ${c.id}`);
    console.log(`  status: ${c.status}`);
    console.log(`  ratePerMin: ${c.ratePerMin}`);
    console.log(`  connectedAt: ${c.connectedAt}`);
  }

  // 9. Wait for billing ticks
  console.log('\nWaiting 6 seconds for billing ticks...');
  await sleep(6000);

  // 10. End call
  console.log('Caller ending call...');
  callerSocket.emit('call:end', { callId: receivedCallId, recipientId: callee.id });
  
  await sleep(2000);

  // 11. Check final state
  const finalCall = await DB.query(`SELECT status, "durationSecs", "totalBilled", "endReason" FROM calls WHERE id=$1`, [receivedCallId]);
  if (finalCall.rowCount > 0) {
    const f = finalCall.rows[0];
    console.log(`\n--- FINAL CALL STATE ---`);
    console.log(`  status: ${f.status}`);
    console.log(`  durationSecs: ${f.durationSecs}`);
    console.log(`  totalBilled: ₹${f.totalBilled}`);
    console.log(`  endReason: ${f.endReason}`);
  }

  const walletFinal = await DB.query(`SELECT balance FROM wallets WHERE "userId"=$1`, [caller.id]);
  console.log(`  Caller wallet: ₹${walletFinal.rows[0]?.balance}`);

  console.log('\n✅ E2E Call Flow Test Complete!');
  
  callerSocket.disconnect();
  calleeSocket.disconnect();
  await DB.end();
  process.exit(0);
}

run().catch(e => {
  console.error('FATAL:', e.message);
  DB.end();
  process.exit(1);
});
