import express from "express";
import * as loiTypeController from '../controllers/loiTypeContoller.js'
const router = express.Router();


router.post("/", loiTypeController.createLoiType);

router.get("/", loiTypeController.getLoiTypes);

export default router;