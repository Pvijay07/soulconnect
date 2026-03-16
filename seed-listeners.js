const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const c = new Client({host:'localhost',port:5432,user:'postgres',password:'V@123',database:'soul_db'});

async function seed() {
  await c.connect();
  
  // First, fix existing listener profiles - approve them and make them available
  await c.query(`
    UPDATE listener_profiles SET 
      "isApproved" = true, 
      "approvalStatus" = 'approved',
      "isAvailable" = true,
      "isVerified" = true,
      status = 'online',
      "avgRating" = 4.2,
      "totalRatings" = 25,
      "totalCalls" = 50,
      "totalMinutes" = 500
  `);
  
  // Update existing listener users to have 'listener' role
  await c.query(`
    UPDATE users SET role = 'listener' WHERE id IN (SELECT "userId" FROM listener_profiles)
  `);
  
  console.log('✅ Updated existing listeners to approved/available');

  const passwordHash = await bcrypt.hash('test1234', 12);

  const listeners = [
    { name: 'Dr. Priya Sharma', phone: '+919876543210', headline: 'Clinical Psychologist | 10+ years', tags: ['Relationship', 'Anxiety'], voiceRate: 5, videoRate: 10, gender: 'female' },
    { name: 'Rahul Verma', phone: '+919876543211', headline: 'Certified Life Coach & Motivational Speaker', tags: ['Career', 'Motivation'], voiceRate: 3, videoRate: 7, gender: 'male' },
    { name: 'Ananya Singh', phone: '+919876543212', headline: 'Relationship Counselor & Therapist', tags: ['Breakup', 'Relationship'], voiceRate: 4, videoRate: 8, gender: 'female' },
    { name: 'Vikram Patel', phone: '+919876543213', headline: 'Mental Wellness Expert & Mindfulness Coach', tags: ['Star', 'Stress'], voiceRate: 7, videoRate: 15, gender: 'male' },
  ];

  for (const l of listeners) {
    // Check if phone already exists
    const exists = await c.query('SELECT id FROM users WHERE phone = $1', [l.phone]);
    if (exists.rows.length > 0) {
      console.log(`⚠️ User with phone ${l.phone} already exists, skipping.`);
      continue;
    }

    const userId = uuidv4();
    
    await c.query(`
      INSERT INTO users (id, phone, "passwordHash", role, status, "authProvider", "phoneVerified", "isAnonymous", "callCount", "referralCode", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, 'listener', 'active', 'phone', true, false, 0, $4, NOW(), NOW())
    `, [userId, l.phone, passwordHash, uuidv4().substring(0, 8).toUpperCase()]);

    await c.query(`
      INSERT INTO profiles ("userId", "displayName", bio, gender, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
    `, [userId, l.name, l.headline, l.gender]);

    await c.query(`
      INSERT INTO wallets ("userId", balance, currency, "createdAt", "updatedAt")
      VALUES ($1, 0, 'INR', NOW(), NOW())
    `, [userId]);

    const rating = (3.5 + Math.random() * 1.5).toFixed(1);
    const totalRatings = Math.floor(10 + Math.random() * 90);
    
    await c.query(`
      INSERT INTO listener_profiles (
        "userId", headline, description, "expertiseTags", languages,
        "voiceRatePerMin", "videoRatePerMin", "isApproved", "approvalStatus",
        "isAvailable", "isVerified", status, "avgRating", "totalRatings",
        "totalCalls", "totalMinutes", "totalEarnings",
        "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, true, 'approved',
        true, true, 'online', $8, $9,
        $10, $11, 0,
        NOW(), NOW()
      )
    `, [
      userId, l.headline, l.headline, JSON.stringify(l.tags), JSON.stringify(['English', 'Hindi']),
      l.voiceRate, l.videoRate,
      rating, totalRatings,
      Math.floor(50 + Math.random() * 200), Math.floor(500 + Math.random() * 2000)
    ]);

    console.log(`✅ Created: ${l.name} (rate: ₹${l.voiceRate}/min, rating: ${rating})`);
  }

  console.log('\n🎉 Seed complete! Database ready for testing.');
  await c.end();
}

seed().catch(e => { console.error('Seed error:', e); c.end(); });
