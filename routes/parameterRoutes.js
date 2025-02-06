import express from "express";
import User from "../models/user.js";
import InstructionType from "../models/instructionType.js";
import Parameter from "../models/parameter.js";

const router = express.Router();

// Create a new Parameter
router.post("/", async (req, res) => {
  const { instruction_id, parameter_msg, significance_level, created_by, modified_by } = req.body;

  try {
    // Validate if InstructionType exists
    const instruction = await InstructionType.findById(instruction_id);
    if (!instruction) {
      return res.status(400).json({ error: "Invalid instruction_id. Instruction Type not found." });
    }

    // Validate if Users exist
    const createdByUser = await User.findById(created_by);
    const modifiedByUser = await User.findById(modified_by);
    if (!createdByUser || !modifiedByUser) {
      return res.status(400).json({ error: "Invalid user IDs for created_by or modified_by." });
    }

    // Create new Parameter
    const newParameter = new Parameter({
      instruction_id,
      parameter_msg,
      significance_level,
      is_deleted: false,
      created_by,
      modified_by,
      created_on: new Date(),
      modified_on: new Date(),
    });

    await newParameter.save();
    res.status(201).json(newParameter);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all parameters for a specific instruction_id
router.get("/instruction/:instruction_id", async (req, res) => {
  const { instruction_id } = req.params;

  try {
    // Validate if InstructionType exists
    const instruction = await InstructionType.findById(instruction_id);
    if (!instruction) {
      return res.status(404).json({ error: "Instruction Type not found." });
    }

    const parameters = await Parameter.find({ instruction_id, is_deleted: false })
      .populate("created_by modified_by", "firstName lastName email");

    res.status(200).json(parameters);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a specific Parameter by ID
// router.get("/:parameter_id", async (req, res) => {
//   try {
//     const parameter = await Parameter.findById(req.params.parameter_id)
//       .populate("created_by modified_by", "firstName lastName email");

//     if (!parameter) {
//       return res.status(404).json({ error: "Parameter not found." });
//     }

//     res.status(200).json(parameter);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// Update a Parameter
// router.put("/:parameter_id", async (req, res) => {
//   const { parameter_msg, significance_level, modified_by } = req.body;

//   try {
//     // Validate if Parameter exists
//     const parameter = await Parameter.findById(req.params.parameter_id);
//     if (!parameter) {
//       return res.status(404).json({ error: "Parameter not found." });
//     }

//     // Validate if modified_by user exists
//     const modifiedByUser = await User.findById(modified_by);
//     if (!modifiedByUser) {
//       return res.status(400).json({ error: "Invalid modified_by user ID." });
//     }

//     parameter.parameter_msg = parameter_msg;
//     parameter.significance_level = significance_level;
//     parameter.modified_by = modified_by;
//     parameter.modified_on = new Date();

//     await parameter.save();
//     res.status(200).json(parameter);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// Soft Delete a Parameter
// router.delete("/:parameter_id", async (req, res) => {
//   try {
//     const parameter = await Parameter.findById(req.params.parameter_id);
//     if (!parameter) {
//       return res.status(404).json({ error: "Parameter not found." });
//     }

//     parameter.is_deleted = true;
//     await parameter.save();

//     res.status(200).json({ message: "Parameter marked as deleted." });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

export default router;
