const express = require('express');
const cors = require('cors');
const http = require('http');
const Redis = require('ioredis');
const socketIoRedis = require('socket.io-redis');
const socketIO = require('socket.io');
const socketIOClient = require('socket.io-client');

const redisPub = new Redis({
    host: 'localhost',
    port: 6379,
    password: 'Pxj2DEAuMWLG2'
});

const redisSub = new Redis({
    host: 'localhost',
    port: 6379,
    password: 'Pxj2DEAuMWLG2'
});

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const socketClient = socketIOClient('http://localhost:3000');

socketClient.on('connect', () => {
    console.log('Server connected to Main Server');
});

socketClient.on('disconnect', () => {
    console.log('Server disconnected from Main Server');
});

const io = socketIO(server, {
    maxHttpBufferSize: 5 * 1024 * 1024,
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Origin", "Content-Type", "Accept", "Authorization"],
        credentials: true
    }
});

io.adapter(socketIoRedis({ pubClient: redisPub, subClient: redisPub.duplicate() }));

redisSub.subscribe('client-server', (err, count) => {
    if (err) {
        console.error('Failed to subscribe to Redis channel', err);
    } else {
        console.log(`Server4 subscribed to ${count} channel(s)`);
    }
});

redisSub.on('message', (channel, message) => {
    console.log("I am in Server4.")
    if (channel === 'client-server') {
        const quiz = JSON.parse(message);
        // console.log(quiz)
        console.log(`Server4 received message from MainServer(current_date): ${quiz.quiz.current_date}`);
    }
});

const PORT = 3004;
server.listen(PORT, () => {
    console.log(`Server4 is running on port ${PORT}`);
});
