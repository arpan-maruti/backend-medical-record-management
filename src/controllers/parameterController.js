import * as parameterService from '#services/parameterService.js';
import User from '#models/user.js';
import InstructionType from '#models/instructionType.js';
import convertKeysToSnakeCase from '#utils/snakeCase.js';

export const addInstruction = async (req, res) => {
    try {
        const { instructionId, parameterMsg, significanceLevel, createdBy, modifiedBy } = req.body;
        const createdByUser = await User.find({ _id: createdBy, isDeleted: false });
        const modifiedByUser = await User.find({ _id: modifiedBy, isDeleted: false });
        if (!createdByUser || !modifiedByUser) {
            return res.status(400).json({
                code: "Bad Request",
                message: "Invalid user_id provided in created_by or modified_by.",
            });
        }
        const instruction = await InstructionType.findById(instructionId);
        if (!instruction) {
            return res.status(400).json({
                code: "Bad Request",
                message: "Invalid instructionId. Instruction Type not found."
            });
        }

        const parameter = await parameterService.addParameterService({ instructionId, parameterMsg, significanceLevel, createdBy, modifiedBy });
        const newParameter = convertKeysToSnakeCase(req.body);
        res.status(201).json({
            code: "Created",
            data: newParameter
        })
    } catch (err) {
        res.status(500).json({
            code: "Internal Error",
            message: "An error occured while creating parameter",
            error: err
        })
    }
}

export const getParametersByInstruction = async (req, res) => {
    try {
        const { id } = req.params;
        const instruction = await InstructionType.findById(id);
        if (!instruction) {
            return res.status(404).json({ code: "Not Found", message: "Instruction Type not found." });
        }
        const parameters = await parameterService.getParametersByInstructionService({id});
        const newParameter = convertKeysToSnakeCase(parameters);

        if (parameters.length === 0) {
            return res.status(404).json({
                code: "Not Found",
                message: "No parameters found for this instruction."
            });
        }
        res.status(200).json({
            code: "Success",
            length: newParameter.length,
            message: "Parameters retrieved successfully.",
            data: newParameter
        });
    } catch (err) {
        res.status(500).json({
            code: "Internal Error",
            message: "An error occured while creating parameter",
            error: err
        })
    }
}