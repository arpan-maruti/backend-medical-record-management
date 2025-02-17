import express from "express";
import multer from 'multer';
import path from 'path';
import { createFileController } from "../controllers/fileController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/files/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post("/", upload.single("file"), createFileController);
// router.delete("/:id", deleteFileController);

export default router;
