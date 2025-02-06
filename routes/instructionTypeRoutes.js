import express from "express";
import User from "../models/user.js";
import LoiType from "../models/loiType.js";
import InstructionType from "../models/instructionType.js";

const router = express.Router();

// Create a new Instruction Type
router.post("/", async (req, res) => {
  const { instruction_msg, loi_id, created_by, modified_by } = req.body;

  try {
    // Validate if LoiType exists
    const loiType = await LoiType.findById(loi_id);
    if (!loiType) {
      return res.status(400).json({ error: "Invalid loi_id. LoiType not found." });
    }

    // Validate if Users exist
    const createdByUser = await User.findById(created_by);
    const modifiedByUser = await User.findById(modified_by);
    if (!createdByUser || !modifiedByUser) {
      return res.status(400).json({ error: "Invalid user IDs for created_by or modified_by." });
    }

    // Create new instruction type
    const newInstruction = new InstructionType({
      instruction_msg,
      loi_id,
      created_by,
      modified_by,
      created_on: new Date(),
      modified_on: new Date(),
    });

    await newInstruction.save();
    res.status(201).json(newInstruction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all instructions for a specific loi_id
router.get("/loi/:loi_id", async (req, res) => {
  const { loi_id } = req.params;

  try {
    // Validate if LoiType exists
    const loiType = await LoiType.findById(loi_id);
    if (!loiType) {
      return res.status(404).json({ error: "LoiType not found." });
    }

    const instructions = await InstructionType.find({ loi_id }).populate("created_by modified_by", "firstName lastName email");
    res.status(200).json(instructions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a specific instruction by ID
// router.get("/:instruction_id", async (req, res) => {
//   try {
//     const instruction = await InstructionType.findById(req.params.instruction_id).populate("created_by modified_by", "firstName lastName email");
//     if (!instruction) {
//       return res.status(404).json({ error: "Instruction Type not found." });
//     }
//     res.status(200).json(instruction);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// Update an instruction type
// router.put("/:instruction_id", async (req, res) => {
//   const { instruction_msg, modified_by } = req.body;

//   try {
//     // Validate if Instruction Type exists
//     const instruction = await InstructionType.findById(req.params.instruction_id);
//     if (!instruction) {
//       return res.status(404).json({ error: "Instruction Type not found." });
//     }

//     // Validate if modified_by user exists
//     const modifiedByUser = await User.findById(modified_by);
//     if (!modifiedByUser) {
//       return res.status(400).json({ error: "Invalid modified_by user ID." });
//     }

//     instruction.instruction_msg = instruction_msg;
//     instruction.modified_by = modified_by;
//     instruction.modified_on = new Date();

//     await instruction.save();
//     res.status(200).json(instruction);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// Delete an instruction type
// router.delete("/:instruction_id", async (req, res) => {
//   try {
//     const instruction = await InstructionType.findById(req.params.instruction_id);
//     if (!instruction) {
//       return res.status(404).json({ error: "Instruction Type not found." });
//     }

//     await InstructionType.findByIdAndDelete(req.params.instruction_id);
//     res.status(200).json({ message: "Instruction Type deleted successfully." });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

export default router;
