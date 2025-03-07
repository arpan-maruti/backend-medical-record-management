import { createFile, deleteFile, updateFileLabel, getFile, patchFile } from "#services/fileService.js";
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
    req.body.filePath = req.file.filename;
    const result = await createFile(req);
    const newResult = convertKeysToSnakeCase(req.body);
    return sendSuccess(res, 201, {
      code: "Created",
      data: result
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, {
      code: error.code || "Internal Server Error",
      message: error.stack,
      error: error.details || null,
    });
  }
};

// New controller for fetching file details
export const getFileController = async (req, res) => {
  try {
    const { id } = req.params;
    const fileData = await getFile(id);
    return sendSuccess(res, 200, {
      code: "Success",
      message: "File fetched successfully",
      data: fileData,
    });
  } catch (err) {
    return sendError(res, 500, {
      code: "Internal Server Error",
      message: err.message,
    });
  }
};

// New controller for patching a file object
export const patchFileController = async (req, res) => {
  try {

    // Only update filePath if the request body has fileFormat and a file is uploaded
    if (Object.prototype.hasOwnProperty.call(req.body, "fileFormat") && req.file) {
      console.log("here");
      req.body.filePath = req.file.filename;
    }
    console.log("req.file", req.body);
    const { id } = req.params;
    const updateData = req.body;
    console.log("updateData", updateData);
    const updatedFile = await patchFile(id, updateData);
    return sendSuccess(res, 200, {
      code: "Success",
      message: "File updated successfully",
      data: updatedFile,
    });
  } catch (err) {
    return sendError(res, 500, {
      code: "Internal Server Error",
      message: err.message,
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

export const patchFileLabelController = async (req, res) => {
  try {
    const { id } = req.params;
    const { files_label } = req.body;
    if (!files_label) {
      return sendError(res, 400, {
        code: "Bad Request",
        message: "files_label is required.",
      });
    }
    const updatedFile = await updateFileLabel(id, files_label);
    return sendSuccess(res, 200, {
      code: "Success",
      message: "File label updated successfully.",
      data: updatedFile,
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, {
      code: error.code || "Internal Server Error",
      message: error.message,
      error: error.details || null,
    });
  }
};