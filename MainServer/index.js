const express = require('express');
const cors = require('cors');
const http = require('http');
const Redis = require('ioredis');
const socketIoRedis = require('socket.io-redis');
const socketIO = require('socket.io');
const { format } = require('date-fns');

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

const io = socketIO(server, {
    maxHttpBufferSize: 5 * 1024 * 1024,
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Origin", "Content-Type", "Accept", "Authorization"],
        credentials: true
    }
});

io.adapter(socketIoRedis({ pubClient: redisPub, subClient: redisSub }));

const redisKey = 'connected_clients_count';

redisPub.set(redisKey, 0, (err) => {
    if (err) {
        console.error("Error resetting connected clients count in Redis:", err);
    } else {
        console.log("Main Server: Redis count has been reset to 0");
    }
});

io.on('connection', (socket) => {
    console.log('Main Server: A server has connected.');

    redisPub.incr(redisKey, (err, newCount) => {
        if (err) {
            console.error("Error incrementing connected servers count in Redis:", err);
        } else {
            console.log(`Main Server: Connected to server. Total connected servers: ${newCount}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Main Server: A server has disconnected.');

        redisPub.decr(redisKey, (err, newCount) => {
            if (err) {
                console.error("Error decrementing connected servers count in Redis:", err);
            } else {
                console.log(`Main Server: Disconnected from server. Total connected servers: ${newCount}`);
            }
        });
    });
});

setInterval(() => {
    let quiz = {
        "quiz_id": "1032",
        "category_id": "14",
        "name": "Del Ques Test Quiz",
        "question_time": 11,
        "time_bonus_point": "0",
        "accuracy_limit": "0",
        "accuracy_bonus": "0",
        "schedule_date": "2024-11-29 18:30",
        "current_date": format(new Date(), 'dd-MM-yyyy HH:mm:ss')
    }
    redisPub.publish('client-server', JSON.stringify({ quiz: quiz }));
}, 5000);

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Main Server is running on port ${PORT}`);
});
