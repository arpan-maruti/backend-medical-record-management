import express from "express";
import Case from "../models/case.js"; // Import the Case model
import User from "../models/user.js"; // Import the User model (to validate userId)
import Parameter from "../models/parameter.js"; // Import the Parameter model (for parameter validation)
import mongoose from "mongoose";

const router = express.Router();

// POST: Create a new case
router.post("/", async (req, res) => {
  const {
    parentId,
    clientName,
    refNumber,
    dateOfBreach,
    caseStatus,
    parameters,
    files,
    isLoi,
    isDeleted,
    createdBy,
    modifiedBy,
  } = req.body;

  if (!clientName) {
    return res.status(400).json({
      code: "Bad Request",
      message: "clientName is required.",
    });
  }

  if (!refNumber) {
    return res.status(400).json({
      code: "Bad Request",
      message: "refNumber is required.",
    });
  }

  if (!dateOfBreach) {
    return res.status(400).json({
      code: "Bad Request",
      message: "dateOfBreach is required.",
    });
  }

  if (!caseStatus) {
    return res.status(400).json({
      code: "Bad Request",
      message: "caseStatus is required.",
    });
  }

  if (!parameters || parameters.length === 0) {
    return res.status(400).json({
      code: "Bad Request",
      message: "parameters are required and must not be empty.",
    });
  }

  const createdByUser = await User.findById(createdBy);
  const modifiedByUser = await User.findById(modifiedBy);
  if (!createdByUser || !modifiedByUser) {
    return res.status(400).json({
      code: "Bad Request",
      message: "Invalid userId provided in createdBy or modifiedBy.",
    });
  }

  const existingCase = await Case.findOne({ refNumber });
  if (existingCase) {
    return res.status(409).json({
      code: "Conflict",
      message: "A case with the given reference number already exists.",
    });
  }

  try {
    const validStatuses = [
      "uploaded",
      "inProgress",
      "aiAnalysisCompleted",
      "error",
    ];
    if (caseStatus && !validStatuses.includes(caseStatus)) {
      return res.status(400).json({
        code: "Bad Request",
        message: `Invalid caseStatus value. Allowed values are: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    if (parameters && parameters.length) {
      const invalidIds = parameters.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id)
      );

      if (invalidIds.length > 0) {
        return res.status(400).json({
          code: "Bad Request",
          message: `The following parameter IDs are invalid: ${invalidIds.join(
            ", "
          )}`,
        });
      }

      // Now check if all the parameters exist in the database
      const validParameters = await Parameter.find({
        _id: { $in: parameters },
      });

      // If the number of valid parameters does not match the length of input, it means some parameters are invalid
      if (validParameters.length !== parameters.length) {
        return res.status(400).json({
          code: "Bad Request",
          message: "One or more invalid parameters.",
        });
      }
    }
    const newCase = new Case({
      parentId: parentId || null,
      clientName,
      refNumber,
      dateOfBreach,
      caseStatus,
      parameters,
      files: files || [],
      isLoi: isLoi || false,
      isDeleted: isDeleted || false,
      createdBy,
      modifiedBy,
    });

    // Save the new case to the database
    await newCase.save();

    res.status(201).json({
      code: "Created",
      message: "Case created successfully.",
      data: newCase,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: "Internal Server Error",
      message: "An error occurred while creating the case.",
    });
  }
});

router.get('/', async(req,res) => {
    try {
        const cases = await Case.find();
        if(cases.length === 0) {
            return res.status(200).json({
                code: "Success",
                message: "No cases found.",
                data: [],
              });
        }
        res.status(200).json({
            code: "Success",
            message: "All cases fetched successfully.",
            data: cases,
          });
    } catch {
        res.status(500).json({
            code: "Internal Server Error",
            message: "An error occurred while fetching the cases.",
          });
    }
});

export default router;
