import express from "express";
import User from "../models/user.js";
import LoiType from "../models/loiType.js";
import InstructionType from "../models/instructionType.js";
import * as instructionTypeContoller from '../controllers/instructionTypeController.js'
const router = express.Router();

router.post("/", instructionTypeContoller.createInstructionType);

// Get instructions for a particular loiId
router.get("/loi/:id", instructionTypeContoller.getInstructionTypeByLoiId);

export default router;
