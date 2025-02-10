import express from "express";
import User from "../models/user.js";
import InstructionType from "../models/instructionType.js";
import Parameter from "../models/parameter.js";

const router = express.Router();

// Create a new Parameter
router.post("/", async (req, res) => {
  const { instruction_id, parameterMsg, significance_level, createdBy, modifiedBy } = req.body;

  try {
    if (!instruction_id) {
      return res.status(400).json({
        code: "Bad Request",
        message: "instruction_id is required."
      });
    }
  
    if (!parameterMsg) {
      return res.status(400).json({
        code: "Bad Request",
        message: "parameterMsg is required."
      });
    }
  
    if (!significance_level) {
      return res.status(400).json({
        code: "Bad Request",
        message: "significance_level is required."
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
    const instruction = await InstructionType.findById(instruction_id);
    if (!instruction) {
      return res.status(400).json({
        code: "Bad Request",
        message: "Invalid instruction_id. Instruction Type not found."
      });
    }

    const createdByUser = await User.findById(createdBy);
    const modifiedByUser = await User.findById(modifiedBy);
    if (!createdByUser || !modifiedByUser) {
      return res.status(400).json({
        code: "Bad Request",
        message: "Invalid user IDs for createdBy or modifiedBy."
      });
    }

    const newParameter = new Parameter({
      instruction_id,
      parameterMsg,
      significance_level,
      is_deleted: false,
      createdBy,
      modifiedBy,
      createdOn: new Date(),
      modifiedOn: new Date(),
    });

    await newParameter.save();
    res.status(201).json({
      code: "Created",
      message: "Parameter created successfully.",
      data: newParameter,
    });
  } catch (err) {
    res.status(500).json({
      code: "Internal Server Error",
      message: "An error occurred while creating the parameter.",
      error: err.message,
    });
  }
});

router.get("/instruction/:instruction_id", async (req, res) => {
  const { instruction_id } = req.params;
  try {
    // Validate if InstructionType exists
    const instruction = await InstructionType.findById(instruction_id);
    if (!instruction) {
      return res.status(404).json({ error: "Instruction Type not found." });
    }
    const parameters = await Parameter.find({ instruction_id, is_deleted: false });
    if (parameters.length === 0) {
      return res.status(404).json({
        code: "Not Found",
        message: "No parameters found for this instruction."
      });
    }
    res.status(200).json({
      code: "Success",
      message: "Parameters retrieved successfully.",
      data: parameters
    });
  } catch (err) {
    res.status(500).json({
      code: "Internal Server Error",
      message: "An error occurred while retrieving parameters.",
      error: err.message
    });
  }
});
export default router;
