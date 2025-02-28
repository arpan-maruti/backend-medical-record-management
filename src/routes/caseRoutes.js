import express from "express";
import * as caseController from "#controllers/caseController.js";
import passport from "passport";
import roleMiddleware from "#middlewares/roleMiddlewares.js";
import multer from "multer";
import path from "path";
const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/files/');
  },
  filename: (req, file, cb) => {
    let fileName = Date.now() + path.extname(file.originalname);
    cb(null, fileName);
  }
  
});
const upload = multer({ storage });

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join('/public/files'));
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// const upload = multer({ storage: storage });

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

router.post("/:caseId/files", 
  passport.authenticate('jwt', { session: false }), 
  roleMiddleware(['user','admin']),
  upload.single('file'),
  caseController.createCaseFileController
);

export default router;