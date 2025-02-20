// Import necessary modules
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import process from 'process';
import UserRoutes from './routes/userRoutes.js'
import LoiTypeRoutes from './routes/loiTypeRoutes.js'
import InstructionTypeRoutes from './routes/instructionTypeRoutes.js';
import ParameterRoutes from './routes/parameterRoutes.js';
import CaseRoutes from './routes/caseRoutes.js';
import FileRoutes from './routes/fileRoutes.js';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import roleMiddleware from './middlewares/roleMiddlewares.js';
import './config/passport.js';
import {errorHandler} from './middlewares/errorHandler.js'
const app = express();
const corsOptions = {
    origin: 'http://localhost:4200', // Your frontend URL
    credentials: true, // Allow cookies to be sent
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static('public'));

// Initialize Passport
app.use(passport.initialize());

const dbUrl = process.env.MONGO_URI;

// Connect to MongoDB using Mongoose
mongoose.connect(dbUrl)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.log('MongoDB connection error:', err);
    });

app.use('/user', UserRoutes);
app.use('/case', CaseRoutes);
app.use("/parameters", ParameterRoutes);
app.use('/file', FileRoutes);
app.use("/instruction-types",  InstructionTypeRoutes);
app.use('/loiType' ,LoiTypeRoutes);

app.use("/instruction-types", passport.authenticate('jwt', { session: false }), roleMiddleware(['user','admin']), InstructionTypeRoutes);
app.use('/loiType' , passport.authenticate('jwt', { session: false }), roleMiddleware(['user','admin']), LoiTypeRoutes);
// Start the server
// app.use(errorHandler);
app.all("*",(req, res,next)=>{
    res.status(404).json({
        status:"fail",
        message: `Can't find ${req.originalUrl} on thie server!`
    });
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});