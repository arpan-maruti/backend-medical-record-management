import express from "express";
import InstructionType from "./models/InstructionType.js"; // Import the model
import LoiType from "./models/loiType.js"; // Import LoiType for reference validation
import User from "./models/user.js"; // Import User for reference validation

const router = express.Router();

// CREATE: Add a new Instruction
router.post("/", async (req, res) => {
  const { instruction_msg, loi_id, created_by, modified_by } = req.body;

  try {
    // Ensure the loi_id exists in the LoiType collection
    const loi = await LoiType.findById(loi_id);
    if (!loi) {
      return res.status(404).json({ message: "LOI not found" });
    }

    // Ensure the user IDs are valid
    const createdUser = await User.findById(created_by);
    const modifiedUser = await User.findById(modified_by);
    if (!createdUser || !modifiedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create the new instruction
    const newInstruction = new InstructionType({
      instruction_msg,
      loi_id,
      created_by,
      modified_by,
    });

    const savedInstruction = await newInstruction.save();
    res.status(201).json(savedInstruction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export default InstructionTypeRoutes;