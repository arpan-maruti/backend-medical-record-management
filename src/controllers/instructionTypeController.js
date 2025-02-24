import * as instructionTypeService from '#services/instructionTypeService.js';
import Joi from "joi";
import convertKeysToSnakeCase from '#utils/snakeCase.js';
import { sendSuccess, sendError } from '#utils/responseHelper.js';

export const createInstructionTypeSchema = Joi.object({
    instructionMsg: Joi.string().required().messages({
        'string.base': 'Instruction message must be a string.',
        'any.required': 'Instruction message is required.'
    }),
    loiId: Joi.string().required().messages({
        'string.base': 'LOI ID must be a valid string.',
        'any.required': 'LOI ID is required.'
    }),
    createdBy: Joi.string().required().messages({
        'string.base': 'Created By must be a valid string.',
        'any.required': 'Created By is required.'
    }),
    modifiedBy: Joi.string().optional().allow(null).messages({
        'string.base': 'Modified By must be a valid string.'
    })
});

export const createInstructionType = async (req, res) => {
    try {
        const { instructionMsg, loiId, createdBy, modifiedBy } = req.body;
        const { error } = createInstructionTypeSchema.validate({ instructionMsg, loiId, createdBy, modifiedBy });
        if (error) {
            return sendError(res, 400, {
                code: 'Bad Request',
                message: error.details[0].message,
            });
        }
        const newInstructionType = await instructionTypeService.createInstructionTypeService({ instructionMsg, loiId, createdBy, modifiedBy });
        const convertedInstruction = convertKeysToSnakeCase(req.body);
        return sendSuccess(res, 201, {
            code: "Created",
            data: convertedInstruction
        });
    } catch (err) {
        return sendError(res, 500, {
            code: "Internal Error",
            message: "An error occured while creating instruction_type",
            error: err.message
        });
    }
};

export const getInstructionTypeByLoiId = async (req, res) => {
    try {
        const { id } = req.params;
        const instructions = await instructionTypeService.getInstructionTypeByLoiIdService({ id });
        const convertedInstruction = convertKeysToSnakeCase(instructions);
        return sendSuccess(res, 200, {
            code: "Ok",
            length: instructions.length,
            data: convertedInstruction
        });
    } catch (err) {
        return sendError(res, 500, {
            code: "Internal Error",
            message: "An error occured while retrieving instruction_type",
            error: err.stack
        });
    }
};