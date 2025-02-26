import * as parameterService from '#services/parameterService.js';
import User from '#models/user.js';
import InstructionType from '#models/instructionType.js';
import convertKeysToSnakeCase from '#utils/snakeCase.js';
import { sendSuccess, sendError } from '#utils/responseHelper.js';

export const addInstruction = async (req, res) => {
    try {
        const { instructionId, parameterMsg, significanceLevel, createdBy, modifiedBy } = req.body;
        const createdByUser = await User.find({ _id: createdBy, isDeleted: false });
        const modifiedByUser = await User.find({ _id: modifiedBy, isDeleted: false });
        if (!createdByUser || !modifiedByUser) {
            return sendError(res, 400, {
                code: "Bad Request",
                message: "Invalid user_id provided in created_by or modified_by."
            });
        }
        const instruction = await InstructionType.findById(instructionId);
        if (!instruction) {
            return sendError(res, 400, {
                code: "Bad Request",
                message: "Invalid instructionId. Instruction Type not found."
            });
        }

        const parameter = await parameterService.addParameterService({
            instructionId,
            parameterMsg,
            significanceLevel,
            createdBy,
            modifiedBy
        });
        const newParameter = convertKeysToSnakeCase(req.body);
        return sendSuccess(res, 201, {
            code: "Created",
            data: newParameter
        });
    } catch (err) {
        return sendError(res, 500, {
            code: "Internal Error",
            message: "An error occured while creating parameter",
            error: err.message
        });
    }
};

export const getParametersByInstruction = async (req, res) => {
    try {
        const { id } = req.params;
        const instruction = await InstructionType.findById(id);
        if (!instruction) {
            return sendError(res, 404, {
                code: "Not Found",
                message: "Instruction Type not found."
            });
        }
        const parameters = await parameterService.getParametersByInstructionService({ id });
        const newParameter = convertKeysToSnakeCase(parameters);

        if (parameters.length === 0) {
            return sendError(res, 404, {
                code: "Not Found",
                message: "No parameters found for this instruction."
            });
        }
        return sendSuccess(res, 200, {
            code: "Success",
            message: "Parameters retrieved successfully.",
            length: newParameter.length,
            data: newParameter
        });
    } catch (err) {
        return sendError(res, 500, {
            code: "Internal Error",
            message: "An error occured while retrieving parameters",
            error: err
        });
    }
};