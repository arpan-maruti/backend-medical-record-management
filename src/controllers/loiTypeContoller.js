// GET request: getEntity(), getUser(), getProduct()
// POST request: createEntity(), addUser(), addProduct()
// PUT/PATCH request: updateEntity(), updateUser(), modifyProduct()
// DELETE request: deleteEntity(), removeUser(), deleteProduct()


import * as loiTypeService from '../services/loiTypeService.js';
import User from '../models/user.js';
export const createLoiType = async (req, res) => {
    const {loiMsg, createdBy, modifiedBy} = req.body;
    try {
        const createdByUser = await User.find({_id: createdBy, isDeleted: false});
        const modifiedByUser = await User.find({_id: modifiedBy, isDeleted: false});

        if(!createdByUser || !modifiedByUser) {
            return res.status(400).json({
                code: "Bad Request",
                message: "Invalid userId provided in createdBy or modifiedBy.",
              });
        }

        const newLoiType = await loiTypeService.createLoiTypeService({loiMsg, createdBy, modifiedBy});
        res.status(201).json({
            code: "Created",
            data: newLoiType,
          });
    } catch(err) {
        res.status(500).json({
            code: "Internal Error",
            message: "An error occured while creating loi_type",
            error: err
        })
    }
}

export const getLoiTypes = async (req, res) => {
    try {
        const loiTypes = await loiTypeService.getLoiTypesService();
        res.status(200).json({
            code: "Success",
            data: loiTypes
        })
    } catch(err) {
        res.status(500).json({
            code: "Internal Error",
            message: "An error occured while creating loi_type",
            error: err
        })
    }
}