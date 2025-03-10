import * as caseService from '#services/caseService.js';
import Case from '#models/case.js';
import User from '#models/user.js';
import convertKeysToSnakeCase from '#utils/snakeCase.js';
import mongoose from 'mongoose';
import { sendSuccess, sendError } from '#utils/responseHelper.js';

export const addCase = async (req, res) => {
    try {
        const {
            parentId,
            clientName,
            refNumber,
            dateOfBreach,
            caseStatus,
            parameters,
            files,
            isDeleted,
            createdBy,
            modifiedBy,
        } = req.body;

        const validStatuses = Case.schema.path("caseStatus").enumValues;

        if (caseStatus && !validStatuses.includes(caseStatus)) {
            return sendError(res, 400, {
                code: "Bad Request",
                message: `Invalid caseStatus value. Allowed values are: ${validStatuses.join(", ")}`
            });
        }

        const createdByUser = await User.findById(createdBy).where('isDeleted').equals(false);
        const modifiedByUser = await User.findById(modifiedBy).where('isDeleted').equals(false);

        if (!createdByUser || !modifiedByUser) {
            return sendError(res, 400, {
                code: "Bad Request",
                message: "Invalid userId provided in createdBy or modifiedBy."
            });
        }

        const existingCase = await Case.findOne({ refNumber });
        if (existingCase) {
            return sendError(res, 409, {
                code: "Conflict",
                message: "A case with the given reference number already exists."
            });
        }

        if (parentId) {
            if (!mongoose.Types.ObjectId.isValid(parentId)) {
                return sendError(res, 400, {
                    code: "Bad Request",
                    message: "The provided parentId is not a valid ObjectId."
                });
            }
        }

        const newCase = await caseService.addCaseService({
            parentId,
            clientName,
            refNumber,
            dateOfBreach,
            caseStatus,
            parameters,
            files,
            isDeleted,
            createdBy,
            modifiedBy
        });

        const updatedCase = convertKeysToSnakeCase(req.body);
        return sendSuccess(res, 201, {
            code: "Created",
            message: "Case created successfully.",
            data: updatedCase
        });
    } catch (err) {
        return sendError(res, 500, {
            code: "Internal Server Error",
            message: "An error occurred while creating the case.",
            error: err.message
        });
    }
};

export const getCase = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id; // Assuming the user ID is stored in req.user after JWT authentication
      const userRole = req.user.userRole; // Assuming the user role is stored in req.user after JWT authentication
        
        
      let newCase = await caseService.getCaseService({ id, userId, userRole });
  
      if (!newCase) {
        return sendError(res, 404, {
          code: "Not Found",
          message: "Case not found or you do not have permission to access this case.",
        });
      }
  
      return sendSuccess(res, 200, {
        code: "Success",
        message: "Case retrieved successfully.",
        data: newCase,
      });
    } catch (err) {
      return sendError(res, 500, {
        code: "Internal Server Error",
        message: "An error occurred while retrieving case.",
        error: err.message,
      });
    }
  };

export const fetchSubacaseOfCase = async (req, res) => {
    try {
        const { id } = req.params;
        let subcases = await caseService.getSubCaseService({ id });
        const newCases = convertKeysToSnakeCase(subcases);
        return sendSuccess(res, 200, {
            code: "Success",
            length: subcases.length,
            message: "All subcases fetched successfully.",
            data: newCases,
        });
    } catch (err) {
        return sendError(res, 500, {
            code: "Internal Server Error",
            message: "An error occurred while fetching subcases.",
            error: err.message,
        });
    }
};

export const updateCase = async (req, res) => {
    
    try {
        const { id } = req.params;
        const caseData = req.body;
        const updatedCase = await caseService.updateCaseService(id, caseData);
        return sendSuccess(res, 200, {
            code: "Success",
            message: "Case updated successfully.",
            data: updatedCase
        });
    } catch (err) {
        return sendError(res, err.status || 500, {
            code: err.code || "Internal Server Error",
            message: err.message || "Error retrieving case.",
            error: err.stack || err.message,
        });
    }
};

export const softDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const caseData = req.body;
        const deletedCase = await caseService.softDeleteService(id, caseData);
        return sendSuccess(res, 209, {
            code: "No content",
            message: "Case deleted"
        });
    } catch (err) {
        return sendError(res, err.status || 500, {
            code: err.code || "Internal Server Error",
            message: err.message || "Error retrieving case.",
            error: err.stack || err.message,
        });
    }
};

export const getFilesOfCase = async (req, res) => {
    try {
        const { id } = req.params;
        const files = await caseService.getFilesOfCaseService(id);
        const newFiles = convertKeysToSnakeCase(files);
        return sendSuccess(res, 200, {
            code: "Success",
            message: "Case updated successfully.",
            data: newFiles,
        });
    } catch (err) {
        return sendError(res, err.status || 500, {
            code: err.code || "Internal Server Error",
            message: err.message || "Error retrieving case.",
            error: err.stack || err.message,
        });
    }
};

export const getAllCases = async (req, res) => {
    try {
        const { cases, pagination } = await caseService.getAllCasesService(req, res);
        const newCases = convertKeysToSnakeCase(cases);
        const newPagination = convertKeysToSnakeCase(pagination);
        return sendSuccess(res, 200, {
            code: "Success",
            length: cases.length,
            message: "All cases fetched successfully",
            data: newCases,
            pagination: newPagination,
        });
    } catch (err) {
        return sendError(res, 500, {
            code: "Internal Server Error",
            message: "An error occurred while fetching the cases",
            error: err.message,
        });
    }
};

// New controller for creating file for a case
export const createCaseFileController = async (req, res) => {
    try {
      const { caseId } = req.params;
      req.body.filePath = req.file.filename;
      if (!req.file) {
        return sendError(res, 400, {
          code: "Bad Request",
          message: "No file uploaded",
        });
      }
      const result = await caseService.createFileForCase(req, caseId);
      return sendSuccess(res, 201, {
        code: "Created",
        data: result,
      });
    } catch (error) {
      return sendError(res, error.statusCode || 500, {
        code: error.code || "Internal Server Error",
        message: error.message,
        error: error.details || null,
      });
    }
  };
