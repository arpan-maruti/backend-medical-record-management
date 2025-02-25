import Parameter from "#models/parameter.js";
import InstructionType from "#models/instructionType.js";
export const addParameterService = async({
    instructionId, parameterMsg, significanceLevel, createdBy, modifiedBy
}) => {
    try {
        const parameter = new Parameter({instructionId, parameterMsg, significanceLevel, createdBy, modifiedBy});
        return await parameter.save({runValidators: true});
    } catch (err) {
        throw new Error(err.message);
    }
}

export const getParametersByInstructionService = async({id}) => {
    try {
        return await Parameter.find({instructionId:id, isDeleted: false})
    } catch (err) {
        throw new Error(err.message);
    }
}