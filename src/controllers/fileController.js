import { createFile } from "../services/fileService.js";

export const validateFileFields = (req, res, next) => {
    const errors = [];
    if (!req.body.fileType) errors.push("fileType");
    if (!req.body.fileFormat) errors.push("fileFormat");
    if (!req.body.createdBy) errors.push("createdBy");
    if (!req.body.modifiedBy) errors.push("modifiedBy");
    
    if (errors.length > 0) {
      return res.status(400).json({
        code: "Bad Request",
        message: `The following fields are required: ${errors.join(', ')}`,
      });
    }
    next();
  };

export const createFileController = async (req, res) => {
  try {
    const result = await createFile(req);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      code: error.code || "Internal Server Error",
      message: error.message,
      error: error.details || null,
    });
  }
};

export const deleteFileController = async (req, res) => {
  try {
    const result = await deleteFile(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      code: error.code || "Internal Server Error",
      message: error.message,
      error: error.details || null,
    });
  }
};
