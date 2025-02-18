// fetch details from database and return no extra validations
// Create: createEntity(), createUser(), addProduct()
// Read: getEntity(), findUserById(), fetchAllProducts()
// Update: updateEntity(), updateUser(), modifyProduct()
// Delete: deleteEntity(), removeUser(), removeProduct()
// Other common methods: getEntityById(), findEntityByField(), processPayment()


import InstructionType from "../models/instructionType.js";
import LoiType from "../models/loiType.js";
export const createInstructionTypeService = async({instructionMsg, loiId, createdBy, modifiedBy}) => {
    const newInstructionType = new InstructionType({instructionMsg, loiId, createdBy, modifiedBy});
    await newInstructionType.save();
    return newInstructionType;
}

export const getInstructionTypeByLoiIdService = async({id}) => {
    const loiType = await LoiType.findById(id);
    if( !loiType) {
        throw new Error("loi_type not found");
    }
    const instructions = await InstructionType.find({ loiId: id });
    console.log(instructions);
    return instructions;
}