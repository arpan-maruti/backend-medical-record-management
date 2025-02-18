// GET request: getEntity(), getUser(), getProduct()
// POST request: createEntity(), addUser(), addProduct()
// PUT/PATCH request: updateEntity(), updateUser(), modifyProduct()
// DELETE request: deleteEntity(), removeUser(), deleteProduct()

import * as instructionTypeService from '../services/instructionTypeService.js';
import User from '../models/user.js'

export const createInstructionType = async (req, res) => {
    try {
        const { instructionMsg, loiId, createdBy, modifiedBy } = req.body;
        const createdByUser = await User.find({ _id: createdBy, isDeleted: false });
        const modifiedByUser = await User.find({ _id: modifiedBy, isDeleted: false });

        if (!createdByUser || !modifiedByUser) {
            return res.status(400).json({
                code: "Bad Request",
                message: "Invalid user_id provided in created_by or modified_by.",
            });
        }
        const newInstructionType = await instructionTypeService.createInstructionTypeService({ instructionMsg, loiId, createdBy, modifiedBy });
        res.status(201).json({
            code: "Created",
            data: newInstructionType
        })
    } catch (err) {
        res.status(500).json({
            code: "Internal Error",
            message: "An error occured while creating instruction_type",
            error: err
        })
    }
}

export const getInstructionTypeByLoiIdService = async (req, res) => {
    try {
        const {id} = req.params;
        const instructions = await instructionTypeService.getInstructionTypeByLoiIdService({id});
        res.status(200).json({
            code: "Ok",
            data: instructions
        });
    } catch (err) {
        res.status(500).json({
            code: "Internal Error",
            message: "An error occured while creating instruction_type",
            error: err
        })
    }
}