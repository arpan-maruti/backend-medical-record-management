import * as caseService from '../services/caseService.js';
import Case from '../models/case.js';
import User from '../models/user.js';

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
            isLoi,
            isDeleted,
            createdBy,
            modifiedBy,
        } = req.body;

        const validStatuses = Case.schema.path("caseStatus").enumValues;

        if (caseStatus && !validStatuses.includes(caseStatus)) {
            return res.status(400).json({
                code: "Bad Request",
                message: `Invalid caseStatus value. Allowed values are: ${validStatuses.join(
                    ", "
                )}`,
            });
        }

        const createdByUser = await User.findById(createdBy).where('isDeleted').equals(false);
        const modifiedByUser = await User.findById(modifiedBy).where('isDeleted').equals(false);
        if (!createdByUser || !modifiedByUser) {
            return res.status(400).json({
                code: "Bad Request",
                message: "Invalid userId provided in createdBy or modifiedBy.",
            });
        }

        const existingCase = await Case.findOne({ refNumber });
        if (existingCase) {
            return res.status(409).json({
                code: "Conflict",
                message: "A case with the given reference number already exists.",
            });
        }
        if (parentId) {
            if (!mongoose.Types.ObjectId.isValid(parentId)) {
                return res.status(400).json({
                    code: "Bad Request",
                    message: "The provided parentId is not a valid ObjectId.",
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
            isLoi,
            isDeleted,
            createdBy,
            modifiedBy
        });
        res.status(201).json({
            code: "Created",
            message: "Case created successfully.",
            data: newCase,
        });
    } catch (err) {
        res.status(500).json({
            code: "Internal Server Error",
            message: "An error occurred while creating the case.",
            error: err.message
        });
    }
}

export const getCase = async (req, res) => {
    try {
        const { id } = req.params;
        const newCase = await caseService.getCaseService({ id });
        res.status(200).json({
            code: "Success",
            message: "Case retrieved successfully.",
            data: newCase,
        });
    } catch (err) {
        res.status(500).json({
            code: "Internal Server Error",
            message: "An error occurred while retrieving case.",
            error: err.message,
        });
    }
}

export const fetchSubacaseOfCase = async (req, res) => {
    try {
        const { id } = req.params;
        const subcases = await caseService.getSubCaseService({ id });
        res.status(200).json({
            code: "Success",
            length: subcases.length,
            message: "All subcases fetched successfully.",
            data: subcases
        })
    } catch (err) {
        res.status(500).json({
            code: "Internal Server Error",
            message: "An error occurred while fetching subcases.",
            error: err.message,
        });
    }
}


//todo: add validation for caseStatus
export const updateCase = async (req, res) => {
    const { id } = req.params;
    const caseData = req.body;

    try {
        const updatedCase = await caseService.updateCaseService(id, caseData);
        res.status(200).json({
            code: "Success",
            message: "Case updated successfully.",
            data: updatedCase,
        });
    } catch (err) {
        res.status(err.status || 500).json({
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
        res.status(209).json({
            code: "No content",
            message: "Case deleted"
        })
    } catch (err) {
        res.status(err.status || 500).json({
            code: err.code || "Internal Server Error",
            message: err.message || "Error retrieving case.",
            error: err.stack || err.message,
        });
    }
}
// export const updateCase
export const getFilesOfCase = async (req, res) => {
    try {
        const { id } = req.params;
        const files = await caseService.getFilesOfCaseService(id);
        res.status(200).json({
            code: "Success",
            message: "Case updated successfully.",
            data: files,
        });
    } catch (err) {
        res.status(err.status || 500).json({
            code: err.code || "Internal Server Error",
            message: err.message || "Error retrieving case.",
            error: err.stack || err.message,
        });
    }
}

export const getAllCases = async (req, res) => {
    try {
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 5;

        const { cases, pagination } = await caseService.getAllCasesService(page, limit);

        res.status(200).json({
            code: "Success",
            length: cases.length,
            message: "All cases fetched successfully",
            data: cases,
            pagination: pagination,
        });
    } catch (err) {
        res.status(500).json({
            code: "Internal Server Error",
            message: "An error occurred while fetching the cases",
            error: err.message,
        });
    }
};

export const fetchCasesofUser = async (req, res) => {
    try {
        const {id} = req.params;
        const cases = await caseService.fetchCasesofUserService(id);
        res.status(200).json({
            code: "Success",
            message: "Cases fetched successfully",
            length : cases.length,
            data: cases
        })
    } catch (err) {
        res.status(500).json({
            code: "Internal Server Error",
            message: "An error occurred while fetching the cases.",
            error: err.message,
        });
    }
}