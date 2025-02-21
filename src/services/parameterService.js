// fetch details from database and return no extra validations
// Create: createEntity(), createUser(), addProduct()
// Read: getEntity(), findUserById(), fetchAllProducts()
// Update: updateEntity(), updateUser(), modifyProduct()
// Delete: deleteEntity(), removeUser(), removeProduct()
// Other common methods: getEntityById(), findEntityByField(), processPayment()

import Parameter from "#models/parameter.js";
import InstructionType from "#models/instructionType.js";
export const addParameterService = async({
    instructionId, parameterMsg, significanceLevel, createdBy, modifiedBy
}) => {
    const parameter = new Parameter({instructionId, parameterMsg, significanceLevel, createdBy, modifiedBy});
    await parameter.save();
    return parameter;
}

export const getParametersByInstructionService = async({id}) => {
    const instruction = await InstructionType.findById(id);
    if(!instruction) {
        throw new Error("instruction not found");
    }
    const parameters = await Parameter.find({instructionId:id, isDeleted: false})
    return parameters;
}