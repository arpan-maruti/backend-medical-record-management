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
import User from './models/user.js';
import jwt from 'jsonwebtoken';

import './config/passport.js';
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



// Attach JWT from cookie to Authorization header


const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        // Ensure the user is authenticated and req.user is populated by Passport
        if (!req.user) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        // Check if the user's role is allowed
        const { userRole } = req.user; // req.user is populated by passport.authenticate
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        // User is authorized
        next();
    };
};



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
app.use("/instruction-types", InstructionTypeRoutes);
app.use('/loiType' , passport.authenticate('jwt', { session: false }), roleMiddleware(['user']), LoiTypeRoutes);
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});