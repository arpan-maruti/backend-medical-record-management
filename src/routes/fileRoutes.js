import express from "express";
import multer from 'multer';
import path from 'path';
import { createFileController, patchFileLabelController } from "#controllers/fileController.js";
import passport from "passport";
import roleMiddleware from "#middlewares/roleMiddlewares.js";
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/files/');
  },
  filename: (req, file, cb) => {
    // cb(null, Date.now() + path.extname(file.originalname));
    let fileName = Date.now() + path.extname(file.originalname);
    cb(null, fileName);
  }
});
const upload = multer({ storage });

router.post("/", passport.authenticate('jwt', { session: false }), roleMiddleware(['user', 'admin']), upload.single("file"), createFileController);

// New PATCH route for updating file label
router.patch("/:id",
  passport.authenticate('jwt', { session: false }),
  roleMiddleware(['user', 'admin']),
  patchFileLabelController
);


// router.delete("/:id", deleteFileController);

export default router;
