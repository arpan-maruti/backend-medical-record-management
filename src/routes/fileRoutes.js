import express from "express";
import multer from 'multer';
import path from 'path';
import { createFileController, getFileController, patchFileController } from "#controllers/fileController.js";
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

router.post("/",
  passport.authenticate('jwt', { session: false }),
  roleMiddleware(['user','admin']),
  upload.single("file"),
  createFileController
);

// New GET route to fetch file details
router.get("/:id",
  passport.authenticate('jwt', { session: false }),
  roleMiddleware(['user','admin']),
  getFileController
);

// New PATCH route for updating file object
router.patch("/:id",
  passport.authenticate('jwt', { session: false }),
  roleMiddleware(['admin']),
  upload.single("file"),
  patchFileController
);

// router.delete("/:id", deleteFileController);

export default router;