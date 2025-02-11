import express from "express";
import User from "../models/user.js";
const router = express.Router();

// Middleware: Automatically load user when a route contains :id
router.param("id", async (req, res, next, id) => {
  try {
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
});

//GET: Get all the users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false });
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
      password,
      countryCode,
      phoneNumber,
      userRole,
      isDeleted,
      createdBy,
      modifiedBy,
    });

    await newUser.save();

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
// verify this
router.get("/:id", async(req,res)=> {
  res.status(200).json({
    code: "Success",
    message: "User retrieved successfully.",
    data: req.user,
  });
});

//PATCH: Update user by id
router.patch("/:id", async(req,res) => {
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
router.patch("/delete/:id", async (req, res) => {
  const { modifiedBy } = req.body;
  try {
    req.user.isDeleted = true;
    req.user.modifiedBy = modifiedBy || req.user.modifiedBy;
    req.user.updatedAt = new Date();
    await req.user.save();

    // Return success message if the user is successfully deleted
    res.status(200).json({
      code: "Success",
      message: "User deleted successfully.",
      data: req.user,
    });
  } catch (err) {
    res.status(500).json({
      code: "Internal Server Error",
      message: "An error occurred while deleting the user.",
      error: err.message,
    });
  }
});


export default router;
