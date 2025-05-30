import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

const userSocketMap = new Map<string, string>(); // Maps userId to socketId

export const setupSocket = (server: HTTPServer): SocketIOServer => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId as string;

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

export { userSocketMap };
