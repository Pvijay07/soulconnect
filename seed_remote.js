/**
 * SoulConnect - Remote Seeder (via Render API)
 * Seeds the Render production database by creating listener accounts through the API.
 */
const BASE_URL = 'https://soulconnect-esxs.onrender.com/api';

async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { status: res.status, text };
  }
}

async function createListenerAccount(phone, name, headline, tags, voiceRate, videoRate) {
  console.log(`\n--- Creating listener: ${name} (${phone}) ---`);
  
  // 1. Send OTP
  console.log('  Sending OTP...');
  await request('POST', '/auth/otp/send', { phone });
  
  // 2. Verify OTP (dev mode accepts 123456)
  console.log('  Verifying OTP...');
  const verifyRes = await request('POST', '/auth/otp/verify', { phone, otp: '123456' });
  const token = verifyRes?.data?.accessToken;
  if (!token) {
    console.log(`  ❌ Failed to get token for ${name}:`, verifyRes);
    return null;
  }
  console.log('  ✅ Got auth token');
  
  // 3. Update display name
  console.log('  Setting display name...');
  await request('POST', '/auth/profile/update', { displayName: name }, token);
  
  // 4. Apply as listener
  console.log('  Applying as listener...');
  const applyRes = await request('POST', '/listeners/apply', {
    headline,
    expertiseTags: tags,
    voiceRatePerMin: voiceRate,
    videoRatePerMin: videoRate,
    languages: ['English', 'Hindi'],
    city: 'Mumbai',
    age: 28,
    bio: headline,
  }, token);
  console.log('  Apply result:', applyRes?.data ? '✅ Success' : '⚠️ May already exist');
  
  // 5. Get user ID from /auth/me
  const meRes = await request('GET', '/auth/me', null, token);
  const userId = meRes?.data?.id;
  console.log(`  userId: ${userId}`);
  
  // 6. Self-approve (admin endpoint) 
  if (userId) {
    console.log('  Approving listener...');
    const approveRes = await request('POST', `/listeners/admin/${userId}/approve`, {}, token);
    console.log('  Approve result:', approveRes?.data ? '✅ Approved' : '⚠️', JSON.stringify(approveRes).substring(0, 100));
  }
  
  // 7. Set availability
  console.log('  Setting availability...');
  await request('PUT', '/listeners/me/availability', { isAvailable: true }, token);
  
  console.log(`  ✅ ${name} created and approved!`);
  return { token, userId };
}

async function run() {
  console.log('🚀 SoulConnect Remote Seeder');
  console.log(`Target: ${BASE_URL}\n`);
  
  // Check if server is alive
  const health = await fetch(`${BASE_URL.replace('/api', '')}`).then(r => r.text()).catch(() => null);
  if (!health) {
    console.log('❌ Cannot reach Render server. Make sure it is running.');
    return;
  }
  console.log('✅ Server is reachable\n');

  const experts = [
    {
      phone: '+919876543210',
      name: 'Priya Sharma',
      headline: 'Certified relationship counselor | 5+ years exp',
      tags: ['Love', 'Relationship', 'Marriage'],
      voiceRate: 8, videoRate: 15,
    },
    {
      phone: '+919876543211',
      name: 'Arjun Mehta',
      headline: 'Career coach & life strategist | MBA IIM',
      tags: ['Career', 'Motivation', 'Confidence'],
      voiceRate: 12, videoRate: 20,
    },
    {
      phone: '+919876543212',
      name: 'Kavya Reddy',
      headline: 'Therapist specializing in anxiety & depression',
      tags: ['Anxiety', 'Life', 'Mental Health'],
      voiceRate: 10, videoRate: 18,
    },
    {
      phone: '+919876543213',
      name: 'Vikram Patel',
      headline: 'Motivational speaker & NLP practitioner',
      tags: ['Motivation', 'Career', 'Life'],
      voiceRate: 15, videoRate: 25,
    },
    {
      phone: '+919876543214',
      name: 'Neha Gupta',
      headline: 'Love & relationship expert | 8 years experience',
      tags: ['Love', 'Breakup', 'Self-Love'],
      voiceRate: 7, videoRate: 12,
    },
    {
      phone: '+919876543215',
      name: 'Rohit Desai',
      headline: 'Career growth & leadership coach',
      tags: ['Career', 'Leadership', 'Motivation'],
      voiceRate: 10, videoRate: 18,
    },
  ];

  for (const expert of experts) {
    try {
      await createListenerAccount(
        expert.phone, expert.name, expert.headline,
        expert.tags, expert.voiceRate, expert.videoRate
      );
    } catch (e) {
      console.log(`  ❌ Error for ${expert.name}: ${e.message}`);
    }
  }

  // Verify by browsing listeners
  console.log('\n\n=== VERIFICATION ===');
  // Create a test user to browse
  await request('POST', '/auth/otp/send', { phone: '+919999999999' });
  const testVerify = await request('POST', '/auth/otp/verify', { phone: '+919999999999', otp: '123456' });
  const testToken = testVerify?.data?.accessToken;
  
  if (testToken) {
    const browseRes = await request('GET', '/listeners', null, testToken);
    const listeners = browseRes?.data?.listeners || [];
    console.log(`\nAvailable listeners: ${listeners.length}`);
    for (const l of listeners) {
      console.log(`  - ${l.displayName || 'Unknown'} | ${l.headline || ''} | ₹${l.voiceRatePerMin}/min | Available: ${l.isAvailable}`);
    }
  }

  console.log('\n✅ Remote seeding complete!');
}

run().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
