import express from "express";
import User from '../models/user.js';
import LoiType from "../models/loiType.js";
const router = express.Router();
router.post('/', async (req, res) => {
    const { loi_msg, created_by, modified_by } = req.body;
  
    try {

      // Make sure the provided users exist
      const createdByUser = await User.findById(created_by);
      const modifiedByUser = await User.findById(modified_by);
  
      if (!createdByUser || !modifiedByUser) {
        return res.status(400).json({ error: 'Invalid user IDs provided for created_by or modified_by.' });
      }
  
      const newLoiType = new LoiType({
        loi_msg,
        created_by,
        modified_by,
        created_on: new Date(),
        modified_on: new Date(),
      });
  
      // Save the new LoiType
      await newLoiType.save();
      res.status(201).json(newLoiType); // Return the created LoiType as a response
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });


  router.get('/', async (req, res) => {
    try {
      const loiTypes = await LoiType.find().populate('created_by modified_by', 'firstName lastName email'); // Populate user info
      res.status(200).json(loiTypes);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });


export default router;