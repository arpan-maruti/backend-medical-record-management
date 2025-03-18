import User from "#models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendPasswordSetupEmail } from "#utils/mailer.js";
import { sendOTP, verifyOTP } from '#utils/otp.js';
import Case from "#models/case.js";
import mongoose from "mongoose";
import { sendSuccess, sendError } from '#utils/responseHelper.js';
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
        const isMatch = await bcrypt.compare(password, user.password);
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

        // Use a PATCH request to update only the password field
        await User.updateOne({ email: decoded.email }, { $set: { password: hashedPassword } });

        return { message: 'Password updated successfully' };
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
            role: user.userRole
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '10h' });
        // console.log("token" + token);
        return token;
    } catch (err) {
        throw new Error(err.message);
    }
};

export const getAllUsers = async (page, limit, search, sortField, sortOrder) => {
    try {
        const searchQuery = search
            ? {
                $or: [
                    { firstName: { $regex: search, $options: "i" } },
                    { lastName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { phoneNumber: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        // Map frontend field names to database field names
        const fieldMapping = {
            firstName: "firstName",
            lastName: "lastName",
            email: "email",
            phoneNumber: "phoneNumber",
            userRole: "userRole",
            isDeleted: "isDeleted",
        };

        const validSortField = fieldMapping[sortField] || "firstName"; // Default field
        const validSortOrder = sortOrder === "desc" ? -1 : 1; // Fix issue with default sorting

        console.log(`Sorting by: ${validSortField}, Order: ${validSortOrder}`);

        // Fetch users with sorting, searching, and pagination
        const users = await User.find(searchQuery)
            .sort({ [validSortField]: validSortOrder }) // Fix sorting issue
            .skip((page - 1) * limit)
            .limit(limit)
            .select("-password");
        console.log(users);
        const totalUsers = await User.countDocuments(searchQuery);

        return { users, totalUsers };
    } catch (err) {
        throw new Error(err.message);
    }
};








export const getUserById = async (id) => {
    try {
        const user = await User.findOne({ _id: id }).select(' -password');
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
        if (!authHeader) throw new Error("Authorization header missing");

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const id = decoded?.id;

        const findBy = req.query?.case_status ? { caseStatus: req.query?.case_status } : {};

        let searchCriteria;
        if (req.user.userRole === "admin") {
            searchCriteria = { parentId: null, isDeleted: false, ...findBy };
        } else if (req.user.userRole === "user") {
            searchCriteria = { parentId: null, createdBy: id, isDeleted: false, ...findBy };
        }


        if (req.query.client_name) {
            searchCriteria.clientName = { $regex: req.query.client_name, $options: 'i' };
        }
        if (req.query.ref_number) {
            searchCriteria.refNumber = { $regex: req.query.ref_number, $options: 'i' };
        }

        let page = parseInt(req.query.page) || 1;
        // if(req.query.limit) page = 1;    
        const limit = parseInt(req.query.limit) || 5;
        let sortBy = req.query?.sort || "-createdAt";
        const skip = (page - 1) * limit;

        const [totalCases, cases] = await Promise.all([
            Case.countDocuments(searchCriteria),
            Case.find(searchCriteria)
                .sort(sortBy)
                .collation({ locale: "en", strength: 2 })
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
                .populate("modifiedBy", "firstName lastName")
                .populate({
                    path: 'files',
                    select: '_id fileStatus fileType'
                })
                .lean()
        ]);


        if (!totalCases) {
            return { cases: [], pagination: { totalItems: 0, totalPages: 0, currentPage: page, itemsPerPage: limit } };
        }
        if (skip >= totalCases) {
            throw new Error("This page does not exist");
        }
        if (sortBy) {
            sortBy = sortBy.split(",").join(" ");
        }


        const bulkOps = cases.map(caseDoc => {
            let fileStatus = caseDoc.files.filter(file => file.fileType !== 'loi').map(file => file.fileStatus);

            const statusPriority = [
                'error',
                'in progress',
                'AI Analysis Completed',
                'uploaded'
            ];

            const newCaseStatus = statusPriority.find(status =>
                fileStatus.includes(status)
            ) || 'uploaded';

            return {
                updateOne: {
                    filter: { _id: caseDoc._id },
                    update: { $set: { caseStatus: newCaseStatus } }
                }
            };

        });
        if (bulkOps.length > 0) {
            await Case.bulkWrite(bulkOps);
        }
        return {
            cases, pagination: {
                totalItems: totalCases,
                totalPages: Math.ceil(totalCases / limit),
                currentPage: page,
                itemsPerPage: limit,
            }
        };
    } catch (err) {
        throw new Error(err.message);
    }
};

export const updateUser = async (id, userData) => {
    try {

        userData.updatedAt = new Date();
        console.log(userData);
        const updatedUser = await User.findOneAndUpdate({ _id: id }, { $set: userData }, { runValidators: true }).lean();
        console.log(updatedUser);
        if (!updatedUser) {
            throw new Error("User not found");
        }
        return await User.findOne({ _id: id });
    } catch (err) {
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