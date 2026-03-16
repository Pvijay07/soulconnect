const Redis = require('ioredis');
const redis = new Redis({ host: 'localhost', port: 6379 });

redis.on('connect', () => {
    console.log('Connected to Redis successfully!');
    redis.quit();
});

redis.on('error', (err) => {
    console.log('Redis Connection Failed:', err.message);
    redis.quit();
});
