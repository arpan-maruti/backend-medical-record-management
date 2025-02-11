import express from "express";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendPasswordSetupEmail } from "../utils/mailer.js";
const router = express.Router();

//GET: Get all the users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
router.get("/:id", async(req,res)=> {
  const {id} = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        code: "Not Found",
        error: "User not found.",
      });
    }
    res.status(200).json({
      code: "Success",
      message: "User retrieved successfully.",
      data: user,
    });
  } catch(err) {
    res.status(500).json({
      code: "Internal Server Error",
      message: "An error occurred while retrieving user.",
      error: err.message,
    });
  }
});

//PATCH: Update user by id
router.patch("/:id", async(req,res) => {
  const {id} = req.params;
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
    const user = await User.findById(id);

    // If user is not found
    if (!user) {
      return res.status(404).json({ code: "Not Found",error: "User not found." });
    }

    // Update user fields with provided data
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.password = password || user.password;
    user.countryCode = countryCode || user.countryCode;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.userRole = userRole || user.userRole;
    user.isDeleted = isDeleted || user.isDeleted; // Using nullish coalescing (to not overwrite undefined)
    user.modifiedBy = modifiedBy || user.modifiedBy;
    user.modifiedAt = new Date(); // Update modification date

    // Save the updated user
    await user.save();

    res.status(200).json({
      code: "Success",
      message: "User updated successfully.",
      data: user,
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
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { modifiedBy } = req.body;
  try {
    const user = await User.findById(id);
    if(!user) {

    }
    
    // If the user is not found, return a 404 error
    if (!user) {
      return res.status(404).json({
        code: "Not Found",
        message: "User not found.",
      });
    }

    user.isDeleted = true;
    user.modifiedBy = modifiedBy || user.modifiedBy;
    user.modifiedAt = new Date();

    await user.save();

    // Return success message if the user is successfully deleted
    res.status(200).json({
      code: "Success",
      message: "User deleted successfully.",
      data: user,
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
