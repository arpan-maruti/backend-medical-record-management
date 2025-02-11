import express from "express";
import File from "../models/file.js";  // Import the File model
import User from "../models/user.js";  // Import the User model (to validate the createdBy and modifiedBy fields)

const router = express.Router();

const validateFileFields = (fields) => {
    const errors = [];
  
    if (!fields.filePath) errors.push("filePath is required.");
    if (!fields.fileType) errors.push("fileType is required.");
    if (!fields.fileFormat) errors.push("fileFormat is required.");
    if (!fields.createdBy) errors.push("createdBy is required.");
    if (!fields.modifiedBy) errors.push("modifiedBy is required.");
  
    return errors;
  };


// POST: Create a new file
router.post("/", async (req, res) => {
  const {
    filePath,
    fileSize,
    fileType,
    fileFormat,
    noOfPages,
    filesLabel,
    createdBy,
    modifiedBy,
  } = req.body;

  const errors = validateFileFields(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      code: "Bad Request",
      message: errors.join(" "),
    });
  }

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
    // Check if createdBy and modifiedBy are valid users
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
      filePath,
      fileSize,
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

export default router;
