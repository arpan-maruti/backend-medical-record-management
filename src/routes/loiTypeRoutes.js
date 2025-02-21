import express from "express";
import * as loiTypeController from '#controllers/loiTypeContoller.js'
const router = express.Router();
import passport from "passport";
import roleMiddleware from "#middlewares/roleMiddlewares.js";

router.post("/",  passport.authenticate('jwt', { session: false }), roleMiddleware(['admin']), loiTypeController.createLoiType);

router.get("/",  passport.authenticate('jwt', { session: false }), roleMiddleware(['user','admin']), loiTypeController.getLoiTypes);

export default router;