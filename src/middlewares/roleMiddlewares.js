// roleMiddleware.js
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        // Ensure the user is authenticated and req.user is populated by Passport
        console.log(allowedRoles);
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

export default roleMiddleware;
