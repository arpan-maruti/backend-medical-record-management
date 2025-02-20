import LoiType from "../models/loiType.js";
import User from "../models/user.js";
export const createLoiTypeService = async ({ loiMsg, createdBy, modifiedBy }) => {
  const newLoiType = new LoiType({
    loiMsg,
    createdBy,
    modifiedBy,
  });
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

  await newLoiType.save({ runValidators: true });

  return newLoiType;
};

export const getLoiTypesService = async () => {
  return LoiType.find();
};
