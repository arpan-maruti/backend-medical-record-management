import express from "express";
import User from "../src/models/user.js";
import LoiType from "../src/models/loiType.js";
import InstructionType from "../src/models/instructionType.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { instruction_msg, loi_id, created_by, modified_by } = req.body;

  try {
    if (!loi_id) {
      return res.status(400).json({
        code: "Bad Request",
        message: "Loi id is required",
      });
    }
    if (!instruction_msg) {
      return res.status(400).json({
        code: "Bad Request",
        message: "instruction_msg is required",
      });
    }
    const loiType = await LoiType.findById(loi_id);
    if (!loiType) {
      return res.status(400).json({
        code: "Bad Request",
        message: "Invalid loi_id. LoiType not found.",
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
    const createdByUser = await User.findById(created_by);
    const modifiedByUser = await User.findById(modified_by);
    if (!createdByUser || !modifiedByUser) {
      return res.status(400).json({
        code: "Bad Request",
        message: "Invalid user IDs for created_by or modified_by.",
      });
    }

    const newInstruction = new InstructionType({
      instruction_msg,
      loi_id,
      created_by,
      modified_by,
      created_on: new Date(),
      modified_on: new Date(),
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
