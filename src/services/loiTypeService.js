import LoiType from "#models/loiType.js";

export const createLoiTypeService = async ({ loiMsg, createdBy, modifiedBy }) => {
  try {
    const newLoiType = new LoiType({
      loiMsg,
      createdBy,
      modifiedBy,
    });
    return await newLoiType.save({ runValidators: true });
  } catch (err) {
    throw new Error(err.message);
  }
};

export const getLoiTypesService = async () => {
  try {
    return await LoiType.find();
  } catch (err) {
    throw new Error(err.message);
  }
};