import Joi from 'joi';
import {
    registerUser,
    loginUser,
    setPassword,
    sendOTPToUser,
    verifyUserOTP,
    getAllUsers,
    getUserById,
    fetchCasesofUserService
} from "#services/userService.js";
import convertKeysToSnakeCase from '#utils/snakeCase.js';
import { sendSuccess, sendError } from '#utils/responseHelper.js'; 


// Validation schemas
const registerSchema = Joi.object({
    firstName: Joi.string().min(3).max(50).required(),
    lastName: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    countryCode: Joi.string().min(1).max(5).required(),
    phoneNumber: Joi.string().min(10).max(15).required(),
    userRole: Joi.string().valid('admin', 'user'),
    createdBy: Joi.string(),
    modifiedBy: Joi.string(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const setPasswordSchema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required(),
});

const otpSchema = Joi.object({
    email: Joi.string().email().required(),
});

const verifyOtpSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
});

export const register = async (req, res) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return sendError(res, 400, { code: "Validation Error", message: error.details[0].message });
    }
    const {
        firstName,
        lastName,
        email,
        countryCode,
        phoneNumber,
        userRole,
        createdBy,
        modifiedBy,
    } = req.body;

    try {
        const newUser = await registerUser({
            firstName,
            lastName,
            email,
            countryCode,
            phoneNumber,
            userRole,
            createdBy,
            modifiedBy,
        });
        const updatedUser = convertKeysToSnakeCase(newUser);
        return sendSuccess(res, 201, { code: "Created", data: updatedUser });
    } catch (err) {
        return sendError(res, 500, { code: "Error", message: err.message });
    }
};

export const login = async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return sendError(res, 400, { code: "Validation Error", message: error.details[0].message });
    }

    const { email, password } = req.body;

    try {
        const user = await loginUser(email, password);
        return sendSuccess(res, 200, {
            message: "Login successful",
            data: { phone: user.phoneNumber },
        });
    } catch (err) {
        return sendError(res, 400, { code: "Error", message: err.message });
    }
};

export const setPasswordController = async (req, res) => {
    const { error } = setPasswordSchema.validate(req.body);
    if (error) {
        return sendError(res, 400, { code: "Validation Error", message: error.details[0].message });
    }

    const { token, password } = req.body;

    try {
        await setPassword(token, password);
        return sendSuccess(res, 200, { code: "Success", message: "Password set successfully." });
    } catch (err) {
        return sendError(res, 400, { code: "Invalid Token", message: err.message });
    }
};

export const sendOTPController = async (req, res) => {
    const { error } = otpSchema.validate(req.body);
    if (error) {
        return sendError(res, 400, { code: "Validation Error", message: error.details[0].message });
    }

    const { email } = req.body;

    try {
        const verificationSid = await sendOTPToUser(email);
        return sendSuccess(res, 200, {
            message: "OTP sent successfully.",
            data: { verificationSid },
        });
    } catch (err) {
        return sendError(res, 500, { code: "Error", message: err.message });
    }
};

export const verifyOTPController = async (req, res) => {
    const { error } = verifyOtpSchema.validate(req.body);
    if (error) {
        return sendError(res, 400, { code: "Validation Error", message: error.details[0].message });
    }

    const { email, otp } = req.body;

    try {
        const token = await verifyUserOTP(email, otp);
        res.cookie('jwt', token, {
            httpOnly: false,
            secure: false,
            sameSite: 'strict',
        });
        return sendSuccess(res, 200, { 
            message: "OTP verification successful.",
            data: { token }
        });
    } catch (err) {
        return sendError(res, 400, { code: "Error", message: err.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        const updatedUsers = convertKeysToSnakeCase(users);
        return sendSuccess(res, 200, {
            code: "Success",
            message: "Users fetched successfully",
            data: { users: updatedUsers, length: updatedUsers.length },
        });
    } catch (err) {
        return sendError(res, 500, { code: "Error", message: err.message });
    }
};

export const getUserByIdController = async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        const updatedUsers = convertKeysToSnakeCase(user.toObject());
    
        return sendSuccess(res, 200, {
            code: "Success",
            message: "User retrieved successfully.",
            data:  updatedUsers ,
        });
    } catch (err) {
        return sendError(res, 404, { code: "Not Found", message: err.message });
    }
};

// Add this at the end of the file along with existing exports
export const logout = async (req, res) => {
    console.log("hhh");
    try {
      // Expire the JWT cookie immediately by setting its expiration date to a past date
      res.cookie('jwt', '', { 
        httpOnly: true, 
        secure: false, // update to true if using https 
        expires: new Date(0), 
        sameSite: 'strict'
      });
      
      return sendSuccess(res, 200, {
        code: "Success",
        message: "Logged out successfully. JWT token expired."
      });
    } catch (err) {
      return sendError(res, 500, {
        code: "Internal Error",
        message: err.message
      });
    }
};

export const fetchCasesofUser = async (req, res) => {
    try {
        const { cases, pagination } = await fetchCasesofUserService(req, res);
        const newCases = convertKeysToSnakeCase(cases);
        const newPagination = convertKeysToSnakeCase(pagination);
        console.log(newCases);
        return sendSuccess(res, 200, {
            code: "Success",
            length: cases.length,
            message: "All cases fetched successfully",
            data: newCases,
            pagination: newPagination,
        });
    } catch (err) {
        return sendError(res, 500, {
            code: "Internal Server Error",
            message: "An error occurred while fetching the cases.",
            error: err.message,
        });
    }
};

// Uncomment and update the lines below for additional controllers as needed:

// export const updateUserController = async (req, res) => {
//     try {
//         const updatedUser = await updateUser(req.user, req.body);
//         return sendSuccess(res, 200, {
//             code: "Success",
//             message: "User updated successfully.",
//             data: updatedUser,
//         });
//     } catch (err) {
//         return sendError(res, 500, { code: "Internal Server Error", message: err.message });
//     }
// };

// export const deleteUserController = async (req, res) => {
//     try {
//         await deleteUser(req.user, req.body.modifiedBy);
//         return sendSuccess(res, 204, { code: "Success", message: "User deleted successfully." });
//     } catch (err) {
//         return sendError(res, 500, { code: "Internal Server Error", message: err.message });
//     }
// };