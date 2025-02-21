import * as loiTypeService from '#services/loiTypeService.js';
import Joi from 'joi';
import convertKeysToSnakeCase from '#utils/snakeCase.js';
const createLoiTypeSchema = Joi.object({
    loiMsg: Joi.string().required().min(1).max(500).messages({
        'string.empty': 'Loi message is required.',
        'string.min': 'Loi message should have at least 1 character.',
        'string.max': 'Loi message should have at most 500 characters.',
    }),
    createdBy: Joi.string().required().messages({
        'string.empty': 'Created by user ID is required.',
    }),
    modifiedBy: Joi.string().messages({
        'string.empty': 'Modified by user ID is required.',
    }),
});

export const createLoiType = async (req, res) => {
    const { loiMsg, createdBy, modifiedBy } = req.body;
    const { error } = createLoiTypeSchema.validate({ loiMsg, createdBy, modifiedBy });

    if (error) {
        return res.status(400).json({
            code: 'Bad Request',
            message: error.details[0].message,
        });
    }

    try {
        const newLoiType = await loiTypeService.createLoiTypeService({ loiMsg, createdBy, modifiedBy });
        const convertedLoiTypes = convertKeysToSnakeCase(req.body);
        res.status(201).json({
            code: 'Created',
            data: convertedLoiTypes
        });
    } catch (err) {
        res.status(500).json({
            code: 'Internal Error',
            message: 'An error occurred while creating loiType',
            error: err.message,
        });
    }
};


export const getLoiTypes = async (req, res) => {
    try {
        const loiTypes = await loiTypeService.getLoiTypesService();
        const convertedLoiTypes = convertKeysToSnakeCase(loiTypes);
        res.status(200).json({
            code: 'Success',
            legth: convertedLoiTypes.length,
            data: convertedLoiTypes,
        });
    } catch (err) {
        res.status(500).json({
            code: 'Internal Error',
            message: 'An error occurred while fetching loiTypes',
            error: err.message,
        });
    }
};
