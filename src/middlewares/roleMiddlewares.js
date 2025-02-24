import { sendError } from '#utils/responseHelper.js';

const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        console.log(allowedRoles);
        if (!req.user) {
            return sendError(res, 403, {
                code: "Forbidden",
                message: "Unauthorized access"
            });
        }
        const { userRole } = req.user;
        if (!allowedRoles.includes(userRole)) {
            return sendError(res, 403, {
                code: "Forbidden",
                message: "Forbidden: Insufficient permissions"
            });
        }
        next();
    };
};

export default roleMiddleware;