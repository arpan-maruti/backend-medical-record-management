import express from "express";
import User from "../models/user.js";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
      createdOn: new Date(),
      modifiedOn: new Date(),
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


router.get("/:id", async(req,res)=> {
  const {id} = req.params;
  try {
    const user = await User.findById(id);
    if(!user) {
      return res.status(404).json({
        code: "Not Found",
        error: "User not found."
      });
    }
    res.status(200).json({
      code: "Success",
      message: "User retrieved successfully.",
      data: user
    });
  } catch {
    res.status(500).json({
      code: "Internal Server Error",
      message: "An error occurred while retrieving user.",
      error: err.message
    })
  }
});

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
      return res.status(404).json({ error: "User not found." });
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
    user.modifiedOn = new Date(); // Update modification date

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

router.get("cases/:id", async (req, res) => {
  const {id} = req.params;
  try {
    
  } catch {

  }
});

export default router;
