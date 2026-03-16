import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000';
const NUM_USERS = 1000; // Simulate 1000 concurrent active users
const MESSAGE_INTERVAL = 1000; // Send a message every 1s

async function simulateUser(userId: string) {
    const socket = io(SERVER_URL, {
        auth: { token: `mock_jwt_for_${userId}` },
        transports: ['websocket'],
    });

    socket.on('connect', () => {
        console.log(`[USER ${userId}] Connected - Starting Stress Test...`);

        // Simulate periodic messaging
        setInterval(() => {
            socket.emit('sendMessage', {
                recipientId: 'listener_99',
                content: `Stress test message from user ${userId} at ${new Date().toISOString()}`,
            });
        }, MESSAGE_INTERVAL);
    });

    socket.on('disconnect', () => {
        console.log(`[USER ${userId}] Disconnected`);
    });

    socket.on('exception', (error) => {
        console.error(`[USER ${userId}] Server Exception:`, error);
    });
}

function runStressTest() {
    console.log('--- SOULCONNECT SYSTEM STRESS SIMULATOR (10,000 req/min) ---');
    for (let i = 0; i < NUM_USERS; i++) {
        const delay = Math.random() * 5000; // Stagger connections
        setTimeout(() => simulateUser(`u_${i}`), delay);
    }
}

runStressTest();
