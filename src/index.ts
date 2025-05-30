import connectDB from "./config/db";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import express, { Application } from "express";
import cookieParser from "cookie-parser";
import http from "http";

import authRouter from './routes/authRouter';
import candidateRouter from './routes/candidateRoute';
import employeeRouter from './routes/employeeRoute';
import adminRouter from './routes/adminRoute';
import aiRouter from "./routes/aiRouter";
import postRouter from "./routes/postRoute";
import connectionRoutes from "./routes/connectionRoute";
import notificationRoutes from "./routes/notificationRoute";
import followRoutes from "./routes/followRoutes";
import applicationsRoutes from "./routes/applicationsRoute";
import { setupSocket, userSocketMap } from "./config/socket";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 5000;

const corsOptions = {
    credentials: true,
    origin: String(process.env.FRONTEND_URL),
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use('/auth', authRouter);
app.use('/candidate', candidateRouter);
app.use('/employee', employeeRouter);
app.use('/admin', adminRouter);
app.use('/post', postRouter);
app.use('/ai', aiRouter);
app.use('/connections', connectionRoutes);
app.use('/notifications', notificationRoutes);
app.use('/follow', followRoutes);
app.use('/application', applicationsRoutes);

// Global error handler
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket server
const io = setupSocket(server); // ← now clean and modular

// Export Socket.io and userSocketMap
export { io, userSocketMap };

// Start the server
const start = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`🚀 Server listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Server startup failed:", error);
        process.exit(1);
    }
};

start();
