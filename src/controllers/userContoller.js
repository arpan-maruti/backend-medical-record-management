import Joi from 'joi';
import {
    registerUser,
    loginUser,
    setPassword,
    sendOTPToUser,
    verifyUserOTP,
    getAllUsers,
    getUserById,
} from "../services/userService.js";

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
        return res.status(400).json({ code: "Validation Error", message: error.details[0].message });
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
        res.status(201).json({ code: "Created", data: newUser });
    } catch (err) {
        res.status(500).json({ code: "Error", message: err.message });
    }
};

export const login = async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { email, password } = req.body;

    try {
        const user = await loginUser(email, password);
        res.json({
            success: true,
            message: "Login successful",
            phone: user.phoneNumber,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const setPasswordController = async (req, res) => {
    const { error } = setPasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ code: "Validation Error", message: error.details[0].message });
    }

    const { token, password } = req.body;

    try {
        await setPassword(token, password);
        res.json({ code: "Success", message: "Password set successfully." });
    } catch (err) {
        res.status(400).json({ code: "Invalid Token", message: err.message });
    }
};

export const sendOTPController = async (req, res) => {
    const { error } = otpSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { email } = req.body;

    try {
        const verificationSid = await sendOTPToUser(email);
        res.status(200).json({
            success: true,
            message: "OTP sent successfully.",
            verificationSid,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const verifyOTPController = async (req, res) => {
    const { error } = verifyOtpSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { email, otp } = req.body;

    try {
        const token = await verifyUserOTP(email, otp);
        res.cookie('jwt', token, {
            httpOnly: false,
            secure: false,
            sameSite: 'strict',
           
        });
        // this.cookieService.set('abc', '123');

        res.status(200).json({ success: true, message: "OTP verification successful.", token });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getUserByIdController = async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        res.status(200).json({
            code: "Success",
            message: "User retrieved successfully.",
            data: user,
        });
    } catch (err) {
        res.status(404).json({ code: "Not Found", message: err.message });
    }
};

// export const updateUserController = async (req, res) => {
//     try {
//         const updatedUser = await updateUser(req.user, req.body);
//         res.status(200).json({
//             code: "Success",
//             message: "User updated successfully.",
//             data: updatedUser,
//         });
//     } catch (err) {
//         res.status(500).json({ code: "Internal Server Error", message: err.message });
//     }
// };

// export const deleteUserController = async (req, res) => {
//     try {
//         await deleteUser(req.user, req.body.modifiedBy);
//         res.status(204).json({ code: "Success", message: "User deleted successfully." });
//     } catch (err) {
//         res.status(500).json({ code: "Internal Server Error", message: err.message });
//     }
// };
