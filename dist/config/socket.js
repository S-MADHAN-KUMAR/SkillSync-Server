"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSocketMap = exports.setupSocket = void 0;
const socket_io_1 = require("socket.io");
const userSocketMap = new Map(); // Maps userId to socketId
exports.userSocketMap = userSocketMap;
const setupSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
        },
    });
    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            console.log(`🔌 User connected: ${userId} -> Socket ID: ${socket.id}`);
            socket.join(userId);
            userSocketMap.set(userId, socket.id);
        }
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${userId}`);
            userSocketMap.delete(userId);
        });
    });
    return io;
};
exports.setupSocket = setupSocket;
