"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const SERVER_URL = 'http://localhost:3000';
const NUM_USERS = 1000;
const MESSAGE_INTERVAL = 1000;
async function simulateUser(userId) {
    const socket = (0, socket_io_client_1.io)(SERVER_URL, {
        auth: { token: `mock_jwt_for_${userId}` },
        transports: ['websocket'],
    });
    socket.on('connect', () => {
        console.log(`[USER ${userId}] Connected - Starting Stress Test...`);
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
        const delay = Math.random() * 5000;
        setTimeout(() => simulateUser(`u_${i}`), delay);
    }
}
runStressTest();
//# sourceMappingURL=stress_test.js.map