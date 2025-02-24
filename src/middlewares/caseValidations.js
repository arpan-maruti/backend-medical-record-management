import mongoose from "mongoose";
import Parameter from "#models/parameter.js";
import { sendError } from "#utils/responseHelper.js";

export const validateCase = (req, res, next) => {
    const errors = [];
    const { clientName, refNumber, dateOfBreach, caseStatus, parameters } = req.body;
    if (!clientName) errors.push("clientName");
    if (!refNumber) errors.push("refNumber");
    if (!dateOfBreach) errors.push("dateOfBreach");
    if (!caseStatus) errors.push("caseStatus");
    if (!parameters || parameters.length === 0) errors.push("parameters");
    if (errors.length > 0) {
        return sendError(res, 400, {
            code: "Bad Request",
            message: `${errors.join(', ')} are required.`
        });
    }
    next();
};

export const validateParameters = async (req, res, next) => {
    const { parameters } = req.body;
    if (parameters && parameters.length) {
        const invalidIds = parameters.filter(
            (id) => !mongoose.Types.ObjectId.isValid(id)
        );
        if (invalidIds.length > 0) {
            return sendError(res, 400, {
                code: "Bad Request",
                message: `${invalidIds.join(', ')} are invalid.`,
            });
        }
        const validParameters = await Parameter.find({
            _id: { $in: parameters },
        });
        if (validParameters.length !== parameters.length) {
            return sendError(res, 400, {
                code: "Bad Request",
                message: "Some parameters are invalid.",
            });
        }
    }
    next();
};