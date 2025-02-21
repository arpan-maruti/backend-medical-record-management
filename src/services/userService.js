import User from "#models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendPasswordSetupEmail } from "#utils/mailer.js";
import { sendOTP, verifyOTP } from '#utils/otp.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async({
    firstName,
    lastName,
    email,
    countryCode,
    phoneNumber,
    userRole = "user",
    createdBy = null,
    modifiedBy = null,
}) => {
    const newUser = new User({
        firstName,
        lastName,
        email,
        countryCode,
        phoneNumber,
        userRole,
        isDeleted: false,
        createdBy,
        modifiedBy,
    });

    await newUser.save();
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "30m" });
    await sendPasswordSetupEmail(email, token);
    const updatedUser = newUser.toObject();
    delete updatedUser._id;
    delete updatedUser.password;
    return updatedUser;
};


export const loginUser = async(email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }

    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid password');
    }

    return user;
};


export const setPassword = async(token, password) => {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
        throw new Error('User not found');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return user;
};


export const sendOTPToUser = async(email) => {
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
        throw new Error('User not found');
    }

    const { phoneNumber, countryCode } = user;
    if (!phoneNumber) {
        throw new Error('User does not have a phone number');
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    const verificationSid = await sendOTP(fullPhoneNumber);

    return verificationSid;
};


export const verifyUserOTP = async(email, otp) => {
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
        throw new Error('User not found');
    }

    const { phoneNumber, countryCode } = user;

    if (!phoneNumber) {
        throw new Error('User does not have a phone number');
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    const verificationCheck = await verifyOTP(fullPhoneNumber, otp);

    if (verificationCheck.status !== 'approved') {
        throw new Error('OTP verification failed');
    }
    const payload = {
        id: user._id, // User ID
        role: user.role // User Role (e.g., admin, manager, etc.)
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '10h' });
    // Store JWT in a secure cookie
    console.log("token" + token);


    return token;
};


export const getAllUsers = async() => {
    return await User.find({ isDeleted: false }).select('-_id -password');
};


export const getUserById = async(id) => {
    const user = await User.findOne({ _id: id, isDeleted: false }).select('-_id -password');
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};



// export const updateUser = async (user, updateData) => {
//   Object.assign(user, updateData, { updatedAt: new Date() });
//   await user.save();
//   return user;
// };


// export const deleteUser = async (user, modifiedBy) => {
//   user.isDeleted = true;
//   user.modifiedBy = modifiedBy || user.modifiedBy;
//   user.updatedAt = new Date();
//   await user.save();
//   return user;
// };