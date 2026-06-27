// Server entry: sets up middleware, routes, and DB connection
import express from 'express';
import connectDb from './config/connectDb.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import interviewRouter from './routes/interview.route.js';
import paymentRouter from './routes/payment.route.js';

dotenv.config();

const app=express();
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const publicDir=path.join(__dirname,'public');
const allowedOrigins=[
    process.env.CLIENT_URL,
    ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []),
    'http://localhost:5173',
].filter(Boolean).map(origin=>origin.trim());

app.use(cors({
    origin: (origin,callback)=>{
        if(!origin || allowedOrigins.includes(origin)){
            return callback(null,true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);
app.use('/api/interview',interviewRouter);
app.use('/api/payment',paymentRouter);

if(existsSync(path.join(publicDir,'index.html'))){
    app.use(express.static(publicDir));
    app.get(/^(?!\/api).*/,(_,res)=>{
        res.sendFile(path.join(publicDir,'index.html'));
    });
}

const PORT=process.env.PORT || 6000;


app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
    connectDb();
})
