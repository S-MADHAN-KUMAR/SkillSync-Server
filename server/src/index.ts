import connectDB from "./config/db";
import cors from "cors";
import dotenv from "dotenv";
import express, { Application, NextFunction, Request, Response } from "express";
import authRouter from './routes/authRouter'
import candidateRouter from './routes/candidateRoute'
import employeeRouter from './routes/employeeRoute'
import adminRouter from './routes/adminRoute'
import { StatusCode } from "./utils/enums";
import { GeneralServerErrorMsg } from "./utils/constants";
import cookieParser from 'cookie-parser';
dotenv.config()

let app: Application = express();
const PORT: number = Number(process.env.PORT) || 5000;

const corsOptions = {
    credentials: true,
    origin: String(process.env.FRONTEND_URL),
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use('/auth', authRouter)
app.use('/candidate', candidateRouter)
app.use('/employee', employeeRouter)
app.use('/admin', adminRouter)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Error:", err.message);

    res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({
            error: GeneralServerErrorMsg.INTERNAL_SERVER_ERROR,
            details: err.message,
        });
});




const start = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`The server is listening on port ${PORT}`);
        });
    } catch (error) {
        console.error(" Server startup failed:", error);
        process.exit(1);
    }
};

start();