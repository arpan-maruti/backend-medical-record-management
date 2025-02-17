// fetch details from database and return no extra validations
// Create: createEntity(), createUser(), addProduct()
// Read: getEntity(), findUserById(), fetchAllProducts()
// Update: updateEntity(), updateUser(), modifyProduct()
// Delete: deleteEntity(), removeUser(), removeProduct()
// Other common methods: getEntityById(), findEntityByField(), processPayment()


import LoiType from "../models/loiType.js";

export const createLoiTypeService = async ({
    loiMsg, createdBy, modifiedBy
}) => {
    const newLoiType = new LoiType({
        loiMsg, createdBy, modifiedBy
    });

    await newLoiType.save();
    return newLoiType;
}

export const getLoiTypesService = async() => {
    return LoiType.find();
}