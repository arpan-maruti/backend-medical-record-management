import express from "express";
import User from "../models/user.js";
import InstructionType from "../models/instructionType.js";
import Parameter from "../models/parameter.js";
import * as parameterContoller from '../controllers/parameterController.js'
const router = express.Router();

//POST: Add new Parameter
router.post("/", parameterContoller.addInstruction);

// Get: Get parameters acc to instructionMsg selected
router.get("/instruction/:id", parameterContoller.getParametersByInstruction);
export default router;
