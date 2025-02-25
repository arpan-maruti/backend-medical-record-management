import InstructionType from "#models/instructionType.js";
export const createInstructionTypeService = async ({ instructionMsg, loiId, createdBy, modifiedBy }) => {
    try {
        const newInstructionType = new InstructionType({ instructionMsg, loiId, createdBy, modifiedBy });
        return await newInstructionType.save({runValidators: true});
    } catch (err) {
        throw new Error(err.message);
    }
}

export const getInstructionTypeByLoiIdService = async ({ id }) => {
    try {
        return await InstructionType.find({ loiId: id });
    } catch (err) {
        throw new Error(err.message);
    }
}