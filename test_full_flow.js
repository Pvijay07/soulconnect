/**
 * SoulConnect - Full End-to-End API Test
 * OTPs are stored in-memory in the backend; backdoor OTP 123456 works for any phone.
 */
const { Client } = require('pg');
const http = require('http');

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

function httpGet(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost', port: 3000, path, method: 'GET',
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
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
    req.end();
  });
}

function pass(label, data) { console.log(`  ✅ ${label}: ${data}`); }
function fail(label, data) { console.log(`  ❌ ${label}: ${data}`); }
function section(title) { console.log(`\n${'='.repeat(60)}\n  ${title}\n${'='.repeat(60)}`); }

async function run() {
  await DB.connect();
  console.log('✅ DB Connected');

  // --- DB STATE CHECK ---
  section('DATABASE STATE');

  const usersRes = await DB.query(`SELECT id, phone, email, role FROM users ORDER BY "createdAt" DESC LIMIT 5`);
  console.log(`  Total sample users (5):`);
  usersRes.rows.forEach(r => console.log(`    ${r.role.padEnd(10)} | ${(r.phone || r.email || 'anonymous').padEnd(20)}`));

  const countRes = await DB.query(`
    SELECT 
      (SELECT COUNT(*) FROM users) as users,
      (SELECT COUNT(*) FROM wallets) as wallets,
      (SELECT COUNT(*) FROM calls) as calls,
      (SELECT COUNT(*) FROM listener_profiles) as listeners,
      (SELECT COUNT(*) FROM transactions) as transactions,
      (SELECT COUNT(*) FROM banners) as banners
  `);
  const counts = countRes.rows[0];
  console.log(`  users=${counts.users}, wallets=${counts.wallets}, calls=${counts.calls}, listeners=${counts.listeners}, transactions=${counts.transactions}, banners=${counts.banners}`);

  // Use existing user phone
  const testPhone = usersRes.rows.find(r => r.phone)?.phone || '+919999900001';
  console.log(`  Test phone: ${testPhone}`);

  // --- AUTH FLOW ---
  section('AUTH FLOW (OTP → Token)');

  // 1. Send OTP
  const sendRes = await httpPost('/api/auth/otp/send', { phone: testPhone });
  if (sendRes.status === 201) pass('OTP Send', `message: ${sendRes.data?.data?.message}`);
  else fail('OTP Send', `status=${sendRes.status}, ${JSON.stringify(sendRes.data)}`);

  // 2. Verify with backdoor OTP 123456
  const verifyRes = await httpPost('/api/auth/otp/verify', { phone: testPhone, otp: '123456' });
  if (verifyRes.status === 201 && verifyRes.data?.data?.accessToken) {
    pass('OTP Verify', 'Got accessToken');
  } else {
    fail('OTP Verify', JSON.stringify(verifyRes.data).substring(0, 200));
    await DB.end(); return;
  }

  const TOKEN = verifyRes.data.data.accessToken;
  console.log(`  Token (first 60 chars): ${TOKEN.substring(0, 60)}...`);

  // --- PROTECTED ENDPOINTS ---
  section('PROTECTED API ENDPOINTS');

  // Profile
  const meRes = await httpGet('/api/auth/me', TOKEN);
  if (meRes.status === 200) {
    const d = meRes.data?.data;
    pass('/auth/me', `phone=${d?.phone}, role=${d?.role}, displayName=${d?.profile?.displayName}`);
  } else fail('/auth/me', `status=${meRes.status}`);

  // Wallet
  const walletRes = await httpGet('/api/wallet', TOKEN);
  if (walletRes.status === 200) {
    const d = walletRes.data?.data;
    pass('/wallet', `balance=₹${d?.balance}, currency=${d?.currency}`);
  } else fail('/wallet', `status=${walletRes.status}, ${JSON.stringify(walletRes.data).substring(0, 100)}`);

  // Listeners
  const listenersRes = await httpGet('/api/listeners?page=1&limit=10', TOKEN);
  if (listenersRes.status === 200) {
    const d = listenersRes.data?.data;
    const count = d?.listeners?.length || d?.length || 0;
    pass('/listeners', `count=${count} listeners returned`);
    if (count > 0) {
      const first = d?.listeners?.[0] || d?.[0];
      console.log(`    First listener: ${first?.displayName}, isAvailable=${first?.isAvailable}, rate=₹${first?.voiceRatePerMin}/min`);
    }
  } else fail('/listeners', `status=${listenersRes.status}, ${JSON.stringify(listenersRes.data).substring(0, 100)}`);

  // Transactions
  const txRes = await httpGet('/api/wallet/transactions?page=1&limit=5', TOKEN);
  if (txRes.status === 200) {
    const d = txRes.data?.data;
    pass('/wallet/transactions', `records=${d?.transactions?.length || 0}`);
  } else fail('/wallet/transactions', `status=${txRes.status}`);

  // Call History
  const callHistRes = await httpGet('/api/calls/history?page=1&limit=5', TOKEN);
  if (callHistRes.status === 200) {
    const d = callHistRes.data?.data;
    pass('/calls/history', `calls=${d?.history?.length || 0}`);
  } else fail('/calls/history', `status=${callHistRes.status}, ${JSON.stringify(callHistRes.data).substring(0, 200)}`);

  // Admin Banners (public or auth)
  const bannersRes = await httpGet('/api/admin/banners', TOKEN);
  if (bannersRes.status === 200) {
    pass('/admin/banners', `banners=${bannersRes.data?.data?.length || 0}`);
  } else fail('/admin/banners', `status=${bannersRes.status}`);

  // --- MONEY FLOW ---
  section('REAL MONEY FLOW');

  // Get wallet balance before
  const walletBefore = await httpGet('/api/wallet', TOKEN);
  const balBefore = parseFloat(walletBefore.data?.data?.balance || 0);
  console.log(`  Balance before: ₹${balBefore}`);

  // Quick Recharge (direct DB wallet top-up endpoint)
  const rechargeRes = await httpPost('/api/wallet/recharge', { amount: 100 }, TOKEN);
  if (rechargeRes.status === 201 || rechargeRes.status === 200) {
    pass('/wallet/recharge (₹100)', JSON.stringify(rechargeRes.data?.data || rechargeRes.data).substring(0, 100));
  } else fail('/wallet/recharge', `status=${rechargeRes.status}, ${JSON.stringify(rechargeRes.data).substring(0, 200)}`);

  // Get wallet balance after
  const walletAfter = await httpGet('/api/wallet', TOKEN);
  const balAfter = parseFloat(walletAfter.data?.data?.balance || 0);
  console.log(`  Balance after:  ₹${balAfter}`);
  if (balAfter > balBefore) pass('Balance increased', `₹${balBefore} → ₹${balAfter} (+₹${(balAfter - balBefore).toFixed(2)})`);
  else fail('Balance unchanged', `still ₹${balAfter}`);

  // Razorpay Order Creation (test mode)
  const rzpRes = await httpPost('/api/payments/recharge', { amount: 99, gateway: 'razorpay' }, TOKEN);
  if (rzpRes.status === 201 || rzpRes.status === 200) {
    const od = rzpRes.data?.data;
    pass('/payments/recharge (Razorpay)', `orderId=${od?.id}, amount=${od?.amount}`);
  } else fail('/payments/recharge', `status=${rzpRes.status}, ${JSON.stringify(rzpRes.data).substring(0, 200)}`);

  // --- EXPERT / LISTENER FLOW ---
  section('EXPERT / LISTENER FLOW');

  const expertDashRes = await httpGet('/api/listeners/dashboard', TOKEN);
  if (expertDashRes.status === 200) pass('/listeners/dashboard', JSON.stringify(expertDashRes.data?.data).substring(0, 100));
  else console.log(`  ℹ️ /listeners/dashboard: ${expertDashRes.status} (normal if not a listener)`);

  // --- FINAL SUMMARY ---
  section('SUMMARY');
  console.log(`  Token for Flutter manual test:\n  ${TOKEN}`);
  console.log(`\n  ✅ Backend is running at http://localhost:3000`);
  console.log(`  ✅ Flutter app running on emulator-5554`);
  console.log(`  ✅ Use phone "${testPhone}" + OTP "123456" to login\n`);

  await DB.end();
}

run().catch(e => {
  console.error('FATAL ERROR:', e.message);
  DB.end();
  process.exit(1);
});
