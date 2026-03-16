/**
 * SoulConnect - Production Data Seeder (schema-corrected)
 */
const { Client } = require('pg');

const DB = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'V@123', database: 'soul_db' });

async function run() {
  await DB.connect();
  console.log('✅ DB Connected');

  // ── 1. SEED BANNERS ─────────────────────────────────────────────────────
  console.log('\n[1/4] Seeding banners...');
  await DB.query(`DELETE FROM banners`);

  const banners = [
    {
      title: '🎉 First Call at Just ₹1/min',
      subtitle: 'Talk to verified experts now. New users get ₹50 free!',
      gradientStart: '#E91E63',
      gradientEnd: '#FF5722',
      type: 'promo',
      isActive: true,
      sortOrder: 1,
    },
    {
      title: '💬 Relationship Experts Online',
      subtitle: '50+ certified counselors available 24/7',
      gradientStart: '#9C27B0',
      gradientEnd: '#3F51B5',
      type: 'category',
      isActive: true,
      sortOrder: 2,
    },
    {
      title: '🧠 Mental Wellness Matters',
      subtitle: 'Connect with a therapist in under 2 minutes',
      gradientStart: '#00BCD4',
      gradientEnd: '#009688',
      type: 'feature',
      isActive: true,
      sortOrder: 3,
    },
    {
      title: '💼 Career Guidance Available',
      subtitle: 'Expert career advice for just ₹10/min',
      gradientStart: '#FF9800',
      gradientEnd: '#F44336',
      type: 'promo',
      isActive: true,
      sortOrder: 4,
    },
  ];

  for (const b of banners) {
    await DB.query(
      `INSERT INTO banners (id, title, subtitle, "gradientStart", "gradientEnd", type, "isActive", "sortOrder", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [b.title, b.subtitle, b.gradientStart, b.gradientEnd, b.type, b.isActive, b.sortOrder]
    );
  }
  console.log(`  ✅ Inserted ${banners.length} banners`);

  // ── 2. UPDATE LISTENER PROFILES ────────────────────────────────────────
  console.log('\n[2/4] Updating listener profiles with real data...');

  const expertData = [
    {
      phone: '+919876543210',
      name: 'Priya Sharma',
      headline: 'Certified relationship counselor | 5+ years exp',
      tags: ['Relationship', 'Breakup', 'Marriage'],
      voiceRate: 8.00, videoRate: 15.00,
      avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=Priya',
    },
    {
      phone: '+919876543211',
      name: 'Arjun Mehta',
      headline: 'Career coach & life strategist | MBA IIM',
      tags: ['Career', 'Friendship', 'Confidence'],
      voiceRate: 12.00, videoRate: 20.00,
      avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=Arjun',
    },
    {
      phone: '+919876543212',
      name: 'Kavya Reddy',
      headline: 'Therapist specializing in anxiety & depression',
      tags: ['Anxiety', 'Mental Health', 'Wellness'],
      voiceRate: 10.00, videoRate: 18.00,
      avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=Kavya',
    },
    {
      phone: '+919876543213',
      name: 'Vikram Patel',
      headline: 'Motivational speaker & NLP practitioner',
      tags: ['Motivation', 'Career', 'Relationship'],
      voiceRate: 15.00, videoRate: 25.00,
      avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=Vikram',
    },
  ];

  for (const expert of expertData) {
    const userRes = await DB.query(`SELECT id FROM users WHERE phone = $1`, [expert.phone]);
    if (userRes.rows.length > 0) {
      const userId = userRes.rows[0].id;

      // Update profile
      await DB.query(
        `UPDATE profiles SET "displayName" = $1, "avatarUrl" = $2, bio = $3 WHERE "userId" = $4`,
        [expert.name, expert.avatar, expert.headline, userId]
      );

      // Update listener profile with correct column names
      await DB.query(
        `UPDATE listener_profiles 
         SET headline = $1, "expertiseTags" = $2, "isAvailable" = true, 
             "isApproved" = true, "approvalStatus" = 'approved', status = 'active',
             "voiceRatePerMin" = $3, "videoRatePerMin" = $4,
             "avgRating" = $5, "totalCalls" = $6
         WHERE "userId" = $7`,
        [
          expert.headline, JSON.stringify(expert.tags),
          expert.voiceRate, expert.videoRate,
          (3.5 + Math.random() * 1.5).toFixed(1),
          Math.floor(Math.random() * 200) + 10,
          userId
        ]
      );
      console.log(`  ✅ Updated: ${expert.name} (${expert.phone})`);
    } else {
      console.log(`  ℹ️ User not found for phone: ${expert.phone}`);
    }
  }

  // ── 3. SEED CALL HISTORY ──────────────────────────────────────────────
  console.log('\n[3/4] Seeding call history...');

  const regularUser = await DB.query(`SELECT id FROM users WHERE role = 'user' LIMIT 1`);
  const listeners = await DB.query(
    `SELECT u.id, lp."voiceRatePerMin" FROM users u 
     JOIN listener_profiles lp ON lp."userId" = u.id 
     WHERE lp.status = 'active' LIMIT 4`
  );

  if (regularUser.rows.length > 0 && listeners.rows.length > 0) {
    const callerId = regularUser.rows[0].id;
    // Delete old test calls
    await DB.query(`DELETE FROM calls WHERE "callerId" = $1`, [callerId]);

    // Valid enums: calls_status_enum: initiating,ringing,connected,active,reconnecting,ended,failed,missed
    // calls_calltype_enum: voice, video
    const statuses = ['ended', 'ended', 'missed', 'ended'];
    const callTypes = ['voice', 'voice', 'voice', 'video'];

    for (let i = 0; i < listeners.rows.length; i++) {
      const calleeId = listeners.rows[i].id;
      const rate = parseFloat(listeners.rows[i].voiceRatePerMin || 10);
      const durationSecs = (Math.floor(Math.random() * 15) + 2) * 60;
      const totalBilled = ((durationSecs / 60) * rate).toFixed(2);
      const daysAgo = i + 1;

      await DB.query(
        `INSERT INTO calls (id, "callerId", "calleeId", "callType", status, "ratePerMin", "durationSecs", "totalBilled", "startedAt", "connectedAt", "endedAt", "createdAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 
           NOW() - INTERVAL '${daysAgo} days',
           NOW() - INTERVAL '${daysAgo} days' + INTERVAL '5 seconds',
           NOW() - INTERVAL '${daysAgo} days' + INTERVAL '${durationSecs} seconds',
           NOW() - INTERVAL '${daysAgo} days')`,
        [callerId, calleeId, callTypes[i], statuses[i], rate, durationSecs, totalBilled]
      );
    }
    console.log(`  ✅ Seeded ${listeners.rows.length} call records`);
  } else {
    console.log('  ℹ️ Skipped call seeding (no users/listeners)');
  }

  // ── 4. ENSURE ALL WALLETS EXIST ───────────────────────────────────────
  console.log('\n[4/4] Ensuring wallets for all users...');
  const allUsers = await DB.query(`SELECT id FROM users`);
  let created = 0;
  for (const u of allUsers.rows) {
    const wExists = await DB.query(`SELECT id FROM wallets WHERE "userId" = $1`, [u.id]);
    if (wExists.rows.length === 0) {
      await DB.query(
        `INSERT INTO wallets (id, "userId", balance, currency, "createdAt", "updatedAt") 
         VALUES (gen_random_uuid(), $1, 150.00, 'INR', NOW(), NOW())`,
        [u.id]
      );
      created++;
    }
  }
  console.log(`  ✅ Created ${created} new wallets (${allUsers.rows.length} total users)`);

  // ── FINAL STATE ────────────────────────────────────────────────────────
  const finalRes = await DB.query(`
    SELECT 
      (SELECT COUNT(*) FROM users) as users,
      (SELECT COUNT(*) FROM wallets) as wallets,
      (SELECT COUNT(*) FROM calls) as calls,
      (SELECT COUNT(*) FROM listener_profiles WHERE status='active') as active_listeners,
      (SELECT COUNT(*) FROM transactions) as transactions,
      (SELECT COUNT(*) FROM banners WHERE "isActive"=true) as active_banners
  `);
  const f = finalRes.rows[0];
  console.log(`\n=== FINAL DB STATE ===`);
  console.log(`  users=${f.users}, wallets=${f.wallets}, calls=${f.calls}`);
  console.log(`  active_listeners=${f.active_listeners}, transactions=${f.transactions}, active_banners=${f.active_banners}`);

  await DB.end();
  console.log('\n✅ Seeding complete!');
}

run().catch(e => {
  console.error('ERROR:', e.message);
  console.error(e.stack);
  DB.end();
  process.exit(1);
});
