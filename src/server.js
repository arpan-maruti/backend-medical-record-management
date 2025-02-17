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
const attachJwtMiddleware = (req, res, next) => {
    const token = req.cookies.jwt;
    console.log(token);
    console.log(req.cookies);
    if (token) {
        req.headers['authorization'] = `Bearer ${token}`;
        console.log('Authorization Header:', req.headers['authorization']);
    }
    next();
};

const roleMiddleware = (allowedRoles) => {
    return async(req, res, next) => {
        try {
            const cookiesHeader = req.headers.cookie; // Retrieve the cookie header
            console.log("Headers:", req.headers.cookie); // Debugging

            if (!cookiesHeader) {
                return res.status(401).json({ message: 'Cookie header missing' });
            }

            // Find and extract the JWT from the cookie header
            const cookies = cookiesHeader.split(';').map(cookie => cookie.trim()); // Split cookies by ';' and trim whitespace
            const jwtCookie = cookies.find(cookie => cookie.startsWith('jwt=')); // Look for the 'jwt=' cookie

            if (!jwtCookie) {
                return res.status(401).json({ message: 'JWT token not found in cookies' });
            }

            const token = jwtCookie.split('=')[1]; // Extract the token value
            console.log(token);
            if (!token) {
                return res.status(401).json({ message: 'JWT token missing or malformed' });
            }


            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token

            // Check if the role is allowed
            const user = await User.findById(decoded.id); // Get user from database
            console.log(user);
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (!allowedRoles.includes(user.userRole)) {
                return res.status(403).json({ message: 'Access denied: insufficient permissions' });
            }

            // Attach user to request for further use
            req.user = user;

            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            console.error('Authorization error:', error);
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
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
app.use('/loiType', roleMiddleware(['user']), attachJwtMiddleware, passport.authenticate('jwt', { session: false }),
    LoiTypeRoutes);
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});