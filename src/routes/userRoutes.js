import express from "express";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendPasswordSetupEmail } from "../utils/mailer.js";
const router = express.Router();
import twilio from 'twilio';
const JWT_SECRET = process.env.JWT_SECRET;
// Middleware: Automatically load user when a route contains :id
const getAllUsers = async (req, res, next) => {
  try {
  const {id} = req.params
    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) {
      return res.status(404).json({
        code: "Not Found",
        message: "User not found.",
      });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({
      code: "Internal Server Error",
      message: "Error retrieving user.",
      error: err.message,
    });
  }
}

//GET: Get all the users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      phone: user.phone_number, // Send user's phone number
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Twilio Config
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  const otp = generateOTP();

  try {
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: TWILIO_PHONE,
      to: phone,
    });

    console.log(`OTP ${otp} sent to ${phone}`);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});
// POST: Add a user
router.post("/register", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password = null,
    countryCode,
    phoneNumber,
    userRole = "user", // Default to 'user' role if not provided
    isDeleted = false, // Default to false if not provided
    createdBy = null, // Default to null if not provided
    modifiedBy = null, // Default to null if not provided
  } = req.body;

  if (!firstName) {
    return res.status(400).json({
      code: "Bad Request",
      message: "First name is required",
    });
  }
  if (!lastName) {
    return res.status(400).json({
      code: "Bad Request",
      message: "Last name is required",
    });
  }
  if (!email) {
    return res.status(400).json({
      code: "Bad Request",
      message: "Email is required",
    });
  }
  if (!countryCode) {
    return res.status(400).json({
      code: "Bad Request",
      message: "Country code is required",
    });
  }
  const phoneRegex = /^[0-9\-\+\(\)\s]*$/; // Allow numbers, +, -, (), and spaces
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).json({
      code: "Bad Request",
      message:
        "Phone number must only contain digits, spaces, and allowed special characters (+, -, ()).",
    });
  }
  if (!phoneNumber) {
    return res.status(400).json({
      code: "Bad Request",
      message: "Phone number is required",
    });
  }

  try {
    const newUser = new User({
      firstName,
      lastName,
      email,
      password:null ,
      countryCode,
      phoneNumber,
      userRole,
      isDeleted: false,
      createdBy,
      modifiedBy,
    });

    await newUser.save();

    // Generate a password setup token (valid for 30 min)
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "30m" });

    // Send email with password setup link
    await sendPasswordSetupEmail(email, token);

    res.status(201).json({ code: "Created", data: newUser });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const message =
        field === "email"
          ? "Email is already registered"
          : "Phone number is already registered";

      return res.status(409).json({
        code: "Conflict",
        message: message,
      });
    }

    res.status(500).json({
      code: "Error",
      message: "An error occurred while registering the user",
      error: err.message,
    });
  }
});

//GET: Get user by id
router.get("/:id", getAllUsers, async(req,res)=> {
  res.status(200).json({
    code: "Success",
    message: "User retrieved successfully.",
    data: req.user,
  });
});

//PATCH: Update user by id
router.patch("/:id", getAllUsers, async(req,res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    countryCode,
    phoneNumber,
    userRole,
    isDeleted,
    modifiedBy,
  } = req.body;

  try {
    req.user.firstName = firstName || req.user.firstName;
    req.user.lastName = lastName || req.user.lastName;
    req.user.email = email || req.user.email;
    req.user.password = password || req.user.password;
    req.user.countryCode = countryCode || req.user.countryCode;
    req.user.phoneNumber = phoneNumber || req.user.phoneNumber;
    req.user.userRole = userRole || req.user.userRole;
    req.user.isDeleted = isDeleted || req.user.isDeleted; // Using nullish coalescing (to not overwrite undefined)
    req.user.modifiedBy = modifiedBy || req.user.modifiedBy;
    req.user.updatedAt = new Date(); // Update modification date

    await req.user.save();

    res.status(200).json({
      code: "Success",
      message: "User updated successfully.",
      data: req.user,
    });
  } catch (err) {
    res.status(500).json({
      code: "Internal Server Error",
      message: "An error occurred while updating the user.",
      error: err.message,
    });
  }
});


// PATCH: Soft delete a user by user_id
// fix: isDeleted not set to true.
router.patch("/delete/:id", getAllUsers, async (req, res) => {
  const { modifiedBy } = req.body;
  try {
    req.user.isDeleted = true;
    req.user.modifiedBy = modifiedBy || req.user.modifiedBy;
    req.user.updatedAt = new Date();
    await req.user.save();

    // Return success message if the user is successfully deleted
    res.status(204).json({
      code: "Success",
      message: "User deleted successfully.",
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      code: "Internal Server Error",
      message: "An error occurred while deleting the user.",
      error: err.message,
    });
  }
});
router.post("/set-password", async (req, res) => {
  const { token, password } = req.body;

  try {
    console.log(password);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ code: "Not Found", message: "User not found" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ code: "Success", message: "Password set successfully. You can now log in." });
  } catch (err) {
    res.status(400).json({ code: "Invalid Token", message: "Invalid or expired token" });
  }
});


export default router;
