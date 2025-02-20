import InstructionType from "../models/instructionType.js";
import User from "../models/user.js";
import LoiType from "../models/loiType.js";
export const createInstructionTypeService = async ({ instructionMsg, loiId, createdBy, modifiedBy }) => {
    const newInstructionType = new InstructionType({ instructionMsg, loiId, createdBy, modifiedBy });
    const createdByUser = await User.findOne({ _id: createdBy, isDeleted: false });
    if (!createdByUser) {
        throw new Error();
    }
    if (modifiedBy) {
        const modifiedByUser = await User.findOne({ _id: modifiedBy, isDeleted: false });
        if(!modifiedByUser) {
            throw new Error();
        }
    }
    await newInstructionType.save();
    return newInstructionType;
}

export const getInstructionTypeByLoiIdService = async ({ id }) => {
    const loiType = await LoiType.findById(id);
    if (!loiType) {
        throw new Error("loi_type not found");
    }
    const instructions = await InstructionType.find({ loiId: id });
    console.log(instructions);
    return instructions;
}