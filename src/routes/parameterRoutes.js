import express from "express";
import * as parameterContoller from '../controllers/parameterController.js';
import passport from "passport";
import roleMiddleware from "../middlewares/roleMiddlewares.js";
const router = express.Router();

//POST: Add new Parameter
router.post("/", passport.authenticate('jwt', { session: false }), roleMiddleware(['admin']), parameterContoller.addInstruction);

// Get: Get parameters acc to instructionMsg selected
router.get("/instruction/:id", passport.authenticate('jwt', { session: false }), roleMiddleware(['admin']), parameterContoller.getParametersByInstruction);
export default router;
