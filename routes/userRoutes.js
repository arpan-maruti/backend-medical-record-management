import express from 'express';
import User from '../models/user.js';
const router = express.Router();

router.post('/users', async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password = null,
    countryCode,
    phoneNumber,
    userRole = 'user', // Default to 'user' role if not provided
    isActive = false,  // Default to false if not provided
    createdBy = null,  // Default to null if not provided
    modifiedBy = null, // Default to null if not provided
  } = req.body;

  try {
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      countryCode,
      phoneNumber,
      userRole,
      isActive,
      createdBy,
      modifiedBy,
      createdOn: new Date(),  // Set createdOn to the current date
      modifiedOn: new Date(), // Set modifiedOn to the current date
    });

    // Save the new user to the database
    await newUser.save();

    // Return the created user as the response
    res.status(201).json(newUser);
  } catch (err) {
    // Handle any errors during the creation process
    res.status(400).json({ error: err.message });
  }
});

export default router;
