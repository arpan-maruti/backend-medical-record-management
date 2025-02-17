import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import OAuth2Strategy from 'passport-oauth2';
import User from '../models/user.js'; // Adjust path to your User model
import crypto from 'crypto';
dotenv.config();

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract token from Authorization header
    secretOrKey: process.env.JWT_SECRET, // Secret key for verifying the token
};

// Register the strategy
passport.use(
    new JwtStrategy(options, async(jwtPayload, done) => {
        try {
            // Find the user associated with the JWT payload
            const user = await User.findById(jwtPayload.id);
            if (user) {
                return done(null, user); // Pass user to req.user
            } else {
                return done(null, false); // No user found
            }
        } catch (error) {
            return done(error, false);
        }
    })
);




const clientId = crypto.randomUUID();
const clientSecret = crypto.randomBytes(32).toString("hex");



passport.use(
    'oauth2',
    new OAuth2Strategy({
            authorizationURL: 'abcd', // Not used in custom setup
            tokenURL: 'abcd', // Not used in custom setup
            clientID: clientId,
            clientSecret: clientSecret, // Optional custom secret
            callbackURL: '', // Not used in this setup
        },
        async(accessToken, refreshToken, profile, done) => {
            try {
                // Decode the JWT passed as "accessToken"
                const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

                // Extract user ID and role from the JWT payload
                const user = await User.findById(decoded.id);
                if (!user) {
                    return done(null, false, { message: 'User not found' });
                }

                // Attach user info to the request
                return done(null, { id: user._id, role: user.userRole });
            } catch (err) {
                return done(err, false, { message: 'Invalid or expired token' });
            }
        }
    )
);
// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async(id, done) => {
    const user = await User.findById(id);
    done(null, user);
});


export default passport;