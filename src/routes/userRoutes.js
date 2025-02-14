import express from "express";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendPasswordSetupEmail } from "../utils/mailer.js";
const router = express.Router();
import { sendOTP } from '../utils/otp.js';
import { verifyOTP } from '../utils/otp.js';
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



// Route to send OTP
router.post('/send-otp', async (req, res) => {
  console.log('Received /send-otp request with email:', req.body.email);
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }

  try {
    // Step 1: Find the user by email
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const { phoneNumber, countryCode } = user;

    // Step 2: Ensure the user has a phone number
    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: 'User does not have a phone number.' });
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    console.log('Sending OTP to:', fullPhoneNumber);

    // Step 3: Send the OTP using your sendOTP function
    const verificationSid = await sendOTP(fullPhoneNumber);

    // Step 4: Respond with success
    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully.',
      verificationSid,
    });
  } catch (error) {
    console.error('Error in /send-otp:', error);
    return res.status(500).json({ success: false, error: 'Failed to send OTP.' });
  }
});

// Route to verify OTP
router.post('/verify-otp', async (req, res) => {
  
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and OTP code are required.' });
  }

  try {
    // Step 1: Find the user by email
    const user = await User.findOne({ email, isDeleted: false });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const { phoneNumber, countryCode } = user;

    // Step 2: Ensure the user has a phone number
    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: 'User does not have a phone number.' });
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    console.log(fullPhoneNumber+" "+otp);
    // Step 3: Verify the OTP
    const verificationCheck = await verifyOTP(fullPhoneNumber, otp);

    if (verificationCheck.status === 'approved') {

      const token = jwt.sign({ phoneNumber }, JWT_SECRET, { expiresIn: '1h' });
      console.log(token);
      return res.status(200).json({
        success: true,
        message: 'OTP verification successful.',
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'OTP verification failed.',
        status: verificationCheck.status,
      });
    }
  } catch (error) {
    console.error('Error in /verify-otp:', error);
    return res.status(500).json({ success: false, error: 'Failed to verify OTP.' });
  }
});



export default router;
