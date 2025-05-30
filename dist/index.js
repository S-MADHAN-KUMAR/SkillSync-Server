"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSocketMap = exports.io = void 0;
const db_1 = __importDefault(require("./config/db"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = __importDefault(require("http"));
const authRouter_1 = __importDefault(require("./routes/authRouter"));
const candidateRoute_1 = __importDefault(require("./routes/candidateRoute"));
const employeeRoute_1 = __importDefault(require("./routes/employeeRoute"));
const adminRoute_1 = __importDefault(require("./routes/adminRoute"));
const aiRouter_1 = __importDefault(require("./routes/aiRouter"));
const postRoute_1 = __importDefault(require("./routes/postRoute"));
const connectionRoute_1 = __importDefault(require("./routes/connectionRoute"));
const notificationRoute_1 = __importDefault(require("./routes/notificationRoute"));
const followRoutes_1 = __importDefault(require("./routes/followRoutes"));
const applicationsRoute_1 = __importDefault(require("./routes/applicationsRoute"));
const socket_1 = require("./config/socket");
Object.defineProperty(exports, "userSocketMap", { enumerable: true, get: function () { return socket_1.userSocketMap; } });
const errorHandler_1 = require("./middlewares/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
const corsOptions = {
    credentials: true,
    origin: String(process.env.FRONTEND_URL),
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)("dev"));
// Routes
app.use('/auth', authRouter_1.default);
app.use('/candidate', candidateRoute_1.default);
app.use('/employee', employeeRoute_1.default);
app.use('/admin', adminRoute_1.default);
app.use('/post', postRoute_1.default);
app.use('/ai', aiRouter_1.default);
app.use('/connections', connectionRoute_1.default);
app.use('/notifications', notificationRoute_1.default);
app.use('/follow', followRoutes_1.default);
app.use('/application', applicationsRoute_1.default);
// Global error handler
app.use(errorHandler_1.errorHandler);
// Create HTTP server
const server = http_1.default.createServer(app);
// Setup WebSocket server
const io = (0, socket_1.setupSocket)(server); // ← now clean and modular
exports.io = io;
// Start the server
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1.default)();
        server.listen(PORT, () => {
            console.log(`🚀 Server listening on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Server startup failed:", error);
        process.exit(1);
    }
});
start();
