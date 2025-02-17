import express from "express";
import File from "../models/file.js";  // Import the File model
import User from "../models/user.js";  // Import the User model (to validate the createdBy and modifiedBy fields)
import multer from 'multer';
import Case from "../models/case.js"
import path from 'path';
import fs from 'fs';

// ref: path.extname(file.originalname) to get extenxtion.
const router = express.Router();
let fileExt, fileName;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the directory where files should be stored
    cb(null, 'public/files/');
  },
  filename: (req, file, cb) => {
    fileExt = path.extname(file.originalname);
    fileName = file.originalname;
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({storage});

const validateFileFields = (req, res, next) => {
  const errors = [];
  if (!req.body.fileType) errors.push("fileType");
  if (!req.body.fileFormat) errors.push("fileFormat");
  if (!req.body.createdBy) errors.push("createdBy");
  if (!req.body.modifiedBy) errors.push("modifiedBy");
  if(errors.length > 0) {
    return res.status(400).json({
      code: "Bad Request",
      message: `The following fields are required: ${errors.join(', ')}`
    });
  }
  next();
}

// POST: Create a new file
router.post("/",upload.single("file"), validateFileFields, async (req, res) => {
  const {
    fileType,
    fileFormat,
    noOfPages,
    filesLabel,
    createdBy,
    modifiedBy,
  } = req.body;
  // Validate fileType value
  const validFileTypes = File.schema.path('fileType').enumValues;
  if (!validFileTypes.includes(fileType)) {
    return res.status(400).json({
      code: "Bad Request",
      message: `Invalid fileType. Allowed values are: ${validFileTypes.join(", ")}`,
    });
  }

  // Validate fileFormat value
  const validFileFormats = File.schema.path('fileFormat').enumValues;
  if (!validFileFormats.includes(fileFormat)) {
    return res.status(400).json({
      code: "Bad Request",
      message: `Invalid fileFormat. Allowed values are: ${validFileFormats.join(", ")}`,
    });
  }

  try {
    const filePath = `/files/${req.file.filename}`;
    const createdByUser = await User.findById(createdBy);
    const modifiedByUser = await User.findById(modifiedBy);

    if (!createdByUser || !modifiedByUser) {
      return res.status(400).json({
        code: "Bad Request",
        message: "Invalid userId provided in createdBy or modifiedBy.",
      });
    }

    // Create a new file
    const newFile = new File({
      fileName: fileName, 
      filePath,
      fileSize: req.file.size,
      fileType,
      fileFormat,
      noOfPages,
      filesLabel,
      createdBy,
      modifiedBy,
    });

    // Save the new file to the database
    await newFile.save();

    res.status(201).json({
      code: "Created",
      message: "File created successfully.",
      data: newFile,
    });
  } catch (err) {
    res.status(500).json({
      code: "Internal Server Error",
      message: "An error occurred while creating the file.",
      error: err.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  const fileId = req.params.id;

  try {
    // Step 1: Delete the file from the File collection
    const deletedFile = await File.findByIdAndDelete(fileId);
    if (!deletedFile) {
      return res.status(404).send("File not found");
    }

    // Step 2: Remove the file reference from the Case collection
    const updatedCase = await Case.updateMany(
      { file: fileId }, // Find cases that have the deleted file ID in their fileIds array
      { $pull: {  file: fileId } } // Remove the fileId from the fileIds array
    );

    // Check if the case was updated
    if (updatedCase.nModified === 0) {
      return res.status(404).send("Case not found with this file reference");
    }

    // Respond with success
    res.status(200).send("File deleted and reference removed from case");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
