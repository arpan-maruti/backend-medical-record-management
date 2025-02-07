import express from "express";
import User from "../models/user.js";
import LoiType from "../models/loiType.js";
const router = express.Router();
router.post("/", async (req, res) => {
  const { loi_msg, created_by, modified_by } = req.body;

  try {
    const createdByUser = await User.findById(created_by);
    const modifiedByUser = await User.findById(modified_by);
    
    if (!loi_msg) {
      return res.status(400).json({
        code: "Bad Request",
        message: "Loi message is required",
      });
    }

    if (!created_by) {
      return res.status(400).json({
        code: "Bad Request",
        message: "created_by is required."
      });
    }
  
    if (!modified_by) {
      return res.status(400).json({
        code: "Bad Request",
        message: "modified_by is required."
      });
    }
    
    const newLoiType = new LoiType({
      loi_msg,
      created_by,
      modified_by,
      createdOn: new Date(),
      modifiedOn: new Date(),
    });

    await newLoiType.save();
    res.status(201).json({
      code: "Created",
      data: newLoiType,
    });
  } catch (err) {
    res.status(500).json({
      code: "Error",
      message: "An error occurred while adding the loi",
      error: err.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const loiTypes = await LoiType.find();
    res.status(200).json(loiTypes);
  } catch (err) {
    res.status(500).json({
      code: "Error",
      message: "An error occurred while adding the loi",
      error: err.message,
    });
  }
});

export default router;
