import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '#models/user.js'; // Adjust path to your User model

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract token from Authorization header
    secretOrKey: process.env.JWT_SECRET, // Secret key for verifying the token
};

// Register the strategy
passport.use(
    new JwtStrategy(options, async(jwtPayload, done) => {
        try {
            // Find the user associated with the JWT payload
            console.log(jwtPayload);
            
            const user = await User.findById(jwtPayload.id);
            console.log(user);
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







export default passport;