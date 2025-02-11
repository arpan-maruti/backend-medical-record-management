import express from "express";
import User from "../models/user.js";
import InstructionType from "../models/instructionType.js";
import Parameter from "../models/parameter.js";

const router = express.Router();

// Create a new Parameter
router.post("/", async (req, res) => {
  const { instructionId, parameterMsg, significanceLevel, createdBy, modifiedBy } = req.body;

  if (!instructionId) {
    return res.status(400).json({
      code: "Bad Request",
      message: "instructionId is required."
    });
  }

  if (!parameterMsg) {
    return res.status(400).json({
      code: "Bad Request",
      message: "parameterMsg is required."
    });
  }

  if (!significanceLevel) {
    return res.status(400).json({
      code: "Bad Request",
      message: "significanceLevel is required."
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
  const newParameter = new Parameter({
    instructionId,
    parameterMsg,
    significanceLevel,
    isDeleted: false,
    createdBy,
    modifiedBy,
    createdOn: new Date(),
    modifiedOn: new Date(),
  });
  try {
    const instruction = await InstructionType.findById(instructionId);
    if (!instruction) {
      return res.status(400).json({
        code: "Bad Request",
        message: "Invalid instructionId. Instruction Type not found."
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

router.get("/instruction/:instructionId", async (req, res) => {
  const { instructionId } = req.params;
  try {
    // Validate if InstructionType exists
    const instruction = await InstructionType.findById(instructionId);
    if (!instruction) {
      return res.status(404).json({ error: "Instruction Type not found." });
    }
    const parameters = await Parameter.find({ instructionId, isDeleted: false });
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
