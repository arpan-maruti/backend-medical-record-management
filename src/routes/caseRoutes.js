import express from "express";
import * as caseController from "#controllers/caseController.js";
import passport from "passport";
import roleMiddleware from "#middlewares/roleMiddlewares.js";

const router = express.Router();

// POST: Create a new case
router.post(
  "/",
  passport.authenticate('jwt', { session: false }),
  roleMiddleware(['user', 'admin']),
  caseController.addCase
);

// GET: Get all cases
router.get(
  "/",
  passport.authenticate('jwt', { session: false }),
  roleMiddleware(['user', 'admin']),
  caseController.getAllCases
);

// GET: Get specific case
router.get(
  "/:id",
  passport.authenticate('jwt', { session: false }),
  roleMiddleware(['user', 'admin']),
  caseController.getCase
);

// GET: Get all the subcases of a given case.
router.get(
  "/:id/subcases",
  passport.authenticate('jwt', { session: false }),
  roleMiddleware(['user', 'admin']),
  caseController.fetchSubacaseOfCase
);

// PATCH: Update case details
router.patch(
  "/:id",
  passport.authenticate('jwt', { session: false }),
  roleMiddleware(['admin']),
  caseController.updateCase
);

// PATCH: Soft-delete case
router.patch(
  "/delete/:id",
  passport.authenticate('jwt', { session: false }),
  roleMiddleware(['admin']),
  caseController.softDelete
);

// GET: Get all the files of a particular case
router.get(
  "/:id/file",
  passport.authenticate('jwt', { session: false }),
  roleMiddleware(['user', 'admin']),
  caseController.getFilesOfCase
);

export default router;