import Joi from "joi";
// errorHandler.js

export const errorHandler = (err, req, res, next) => {
    if (err instanceof Joi.ValidationError) {
        return res.status(400).json({
            code: 'Bad Request',
            message: err.message,
        });
    }

    // if (err.message.includes('Invalid ObjectId format')) {
    //     console.log(11111);
    //     return res.status(400).json({
    //         code: 'Bad Request',
    //         message: err.message,
    //     });
    // }

    // if (err.message.includes('User not found')) {
    //     return res.status(404).json({
    //         code: 'Not Found',
    //         message: err.message,
    //     });
    // }

    res.status(500).json({
        code: 'Internal Server Error',
        message: err.message || 'An unknown error occurred',

    });
};

