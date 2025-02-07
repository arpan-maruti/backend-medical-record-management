import express from "express";
import User from "../models/user.js";
import LoiType from "../models/loiType.js";
import InstructionType from "../models/instructionType.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { instructionMsg, loi_id, createdBy, modifiedBy } = req.body;

  try {
    if (!loi_id) {
      return res.status(400).json({
        code: "Bad Request",
        message: "Loi id is required",
      });
    }
    if (!instructionMsg) {
      return res.status(400).json({
        code: "Bad Request",
        message: "instructionMsg is required",
      });
    }
    const loiType = await LoiType.findById(loi_id);
    if (!loiType) {
      return res.status(400).json({
        code: "Bad Request",
        message: "Invalid loi_id. LoiType not found.",
      });
    }
    if (!createdBy) {
      return res.status(400).json({
        code: "Bad Request",
        message: "createdBy is required."
      });
    }
  
    if (!modifiedBy) {
      return res.status(400).json({
        code: "Bad Request",
        message: "modifiedBy is required."
      });
    }
    const createdByUser = await User.findById(createdBy);
    const modifiedByUser = await User.findById(modifiedBy);
    if (!createdByUser || !modifiedByUser) {
      return res.status(400).json({
        code: "Bad Request",
        message: "Invalid user IDs for createdBy or modifiedBy.",
      });
    }

    const newInstruction = new InstructionType({
      instructionMsg,
      loi_id,
      createdBy,
      modifiedBy,
      createdOn: new Date(),
      modifiedOn: new Date(),
    });

    await newInstruction.save();
    res.status(201).json({
      code: "Created",
      message: "Instruction created successfully.",
      data: newInstruction,
    });
  } catch (err) {
    res.status(500).json({
      code: "Internal Server Error",
      message: "An error occurred while creating the instruction.",
      error: err.message,
    });
  }
});


// Get instructions for a particular loi_id
router.get("/loi/:loi_id", async (req, res) => {
  const { loi_id } = req.params;

  try {
    // Validate if LoiType exists
    const loiType = await LoiType.findById(loi_id);
    if (!loiType) {
      return res.status(404).json({ code: "Not Found", error: "LoiType not found." });
    }

    const instructions = await InstructionType.find({ loi_id });
    res.status(200).json({code: "Ok", data:instructions});
  } catch (err) {
    res.status(500).json({
      code: "Internal Server Error",
      message: "An error occurred while creating the instruction.",
      error: err.message,
    });
  }
});

export default router;
