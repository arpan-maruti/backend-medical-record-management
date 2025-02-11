import express from "express";
import User from "../models/user.js";
import LoiType from "../models/loiType.js";
import InstructionType from "../models/instructionType.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { instructionMsg, loiId, createdBy, modifiedBy } = req.body;

  if (!loiId) {
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
  const newInstruction = new InstructionType({
    instructionMsg,
    loiId,
    createdBy,
    modifiedBy
  });
  try {
    const loiType = await LoiType.findById(loiId);
    if (!loiType) {
      return res.status(400).json({
        code: "Bad Request",
        message: "Invalid loiId. LoiType not found.",
      });
    }
    const createdByUser = await User.findOne({createdBy: createdBy, isDeleted: false});
    const modifiedByUser = await User.findOne({modifiedBy: modifiedBy, isDeleted: false});
    if (!createdByUser || !modifiedByUser) {
      return res.status(400).json({
        code: "Bad Request",
        message: "Invalid userId provided in createdBy or modifiedBy.",
      });
    }


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


// Get instructions for a particular loiId
router.get("/loi/:loiId", async (req, res) => {
  const { loiId } = req.params;

  try {
    // Validate if LoiType exists
    const loiType = await LoiType.findById(loiId);
    if (!loiType) {
      return res.status(404).json({ code: "Not Found", error: "LoiType not found." });
    }
    const instructions = await InstructionType.find({ loiId });
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
