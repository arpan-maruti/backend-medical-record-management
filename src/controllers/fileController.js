import { createFile, deleteFile } from "#services/fileService.js";
import convertKeysToSnakeCase from '#utils/snakeCase.js';
import { sendSuccess, sendError } from '#utils/responseHelper.js';

export const validateFileFields = (req, res, next) => {
  const errors = [];
  if (!req.body.fileType) errors.push("fileType");
  if (!req.body.fileFormat) errors.push("fileFormat");
  if (!req.body.createdBy) errors.push("createdBy");
  if (!req.body.modifiedBy) errors.push("modifiedBy");

  if (errors.length > 0) {
    return sendError(res, 400, {
      code: "Bad Request",
      message: `The following fields are required: ${errors.join(', ')}`
    });
  }
  next();
};

export const createFileController = async (req, res) => {
  try {
    const result = await createFile(req);
    const newResult = convertKeysToSnakeCase(req.body);
    return sendSuccess(res, 201, {
      code: "Created",
      data: newResult
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, {
      code: error.code || "Internal Server Error",
      message: error.message,
      error: error.details || null,
    });
  }
};

export const deleteFileController = async (req, res) => {
  try {
    const result = await deleteFile(req.params.id);
    return sendSuccess(res, 200, {
      data: result
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, {
      code: error.code || "Internal Server Error",
      message: error.message,
      error: error.details || null,
    });
  }
};