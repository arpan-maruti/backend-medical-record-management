import express from "express";
import * as instructionTypeContoller from '../controllers/instructionTypeController.js'
const router = express.Router();
import passport from "passport";
import roleMiddleware from "../middlewares/roleMiddlewares.js";
router.post("/", passport.authenticate('jwt', { session: false }), roleMiddleware(['admin']),instructionTypeContoller.createInstructionType);

// Get instructions for a particular loiId
router.get("/loi/:id", passport.authenticate('jwt', { session: false }), roleMiddleware(['user','admin']),instructionTypeContoller.getInstructionTypeByLoiIdService);

export default router;
