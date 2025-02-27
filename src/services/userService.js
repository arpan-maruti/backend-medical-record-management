import User from "#models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendPasswordSetupEmail } from "#utils/mailer.js";
import { sendOTP, verifyOTP } from '#utils/otp.js';
import Case from "#models/case.js";
const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async ({
    firstName,
    lastName,
    email,
    countryCode,
    phoneNumber,
    userRole = "user",
    createdBy = null,
    modifiedBy = null,
}) => {
    try {

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
    } catch (err) {
        throw new Error(err.message);
    }
};


export const loginUser = async (email, password) => {
    try {

        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        const isMatch = bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid password');
        }

        return user;
    } catch (err) {
        throw new Error(err.message);
    }
};


export const setPassword = async (token, password) => {
    try {

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            throw new Error('User not found');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        return user;
    } catch (err) {
        throw new Error(err.message);
    }
};


export const sendOTPToUser = async (email) => {
    try {

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
    } catch (err) {
        throw new Error(err.message);
    }
};


export const verifyUserOTP = async (email, otp) => {
    try {

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
            id: user._id,
            role: user.role
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '10h' });
        console.log("token" + token);
        return token;
    } catch (err) {
        throw new Error(err.message);
    }
};


export const getAllUsers = async () => {
    try {
        return await User.find({ isDeleted: false }).select('-_id -password');
    } catch (err) {
        throw new Error(err.message);
    }
};


export const getUserById = async (id) => {
    try {
        const user = await User.findOne({ _id: id, isDeleted: false }).select('-_id -password');
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (err) {
        throw new Error(err.message);
    }
};


export const fetchCasesofUserService = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("authHeader" + authHeader);
        if (!authHeader) {
            throw new Error("Authorization header missing");
        }
        const token = authHeader.split(" ")[1];
        console.log("token" + token);
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            throw new Error("Invalid token");
        }
        // Use id from the decoded payload
        const id = decoded.id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        let sortBy = req.query.sort || "-createdAt";
        const skip = (page - 1) * limit;

        let searchCriteria = { parentId: null, createdBy: id, isDeleted: false };
        const totalCases = await Case.countDocuments(searchCriteria);
        if (req.query.client_name) {
            searchCriteria.clientName = { $regex: req.query.client_name, $options: 'i' };
        }
        if (totalCases === 0) {
            return { cases: [], pagination: { total_items: 0, total_pages: 0, current_page: page, items_per_page: limit } };
        }
        const totalPages = Math.ceil(totalCases / limit);

        if (skip >= totalCases) {
            throw new Error("This page does not exist");
        }

        if (sortBy) {
            sortBy = sortBy.split(",").join(" ");
        }

        const cases = await Case.find(searchCriteria)
            .sort(sortBy)
            .limit(limit)
            .skip(skip)
            .populate({
                path: 'parameters',
                populate: {
                    path: 'instructionId',
                    select: 'instructionMsg loiId',
                    populate: {
                        path: 'loiId',
                        select: 'loiMsg'
                    }
                }
            })
            .populate("modifiedBy", "firstName lastName").lean();

        const pagination = {
            totalItems: totalCases,
            totalPages: totalPages,
            currentPage: page,
            itemsPerPage: limit,
        };

        return { cases, pagination };
    } catch (err) {
        throw new Error(err.message);
    }
};



export const updateUser = async (id, userData) => {
    try {
        console.log("id", id, "userData", userData);
    
        userData.updatedAt = new Date();
        const updatedUser = await User.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: userData }, { runValidators: true }).lean();
        if (!updatedUser) {
            throw new Error("User not foundqq");
        }
        return await User.findOne({_id:id});
    }catch (err) {
        throw new Error(err.message);
      }
};


// export const deleteUser = async (user, modifiedBy) => {
//   user.isDeleted = true;
//   user.modifiedBy = modifiedBy || user.modifiedBy;
//   user.updatedAt = new Date();
//   await user.save();
//   return user;
// };