import express from 'express';
import User from '../models/user.js';
const router = express.Router();
router.post('/users', async (req, res) => {
    const { firstName, lastName, email, phoneNumber } = req.body;
    try {
      const newUser = new User({
        firstName,
        lastName,
        email,
        phoneNumber,
      });
  
      await newUser.save();
  
      res.status(201).json(newUser);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  export default router;