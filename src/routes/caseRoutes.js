import express from "express";
import Case from "../models/case.js"; // Import the Case model
import User from "../models/user.js"; // Import the User model (to validate userId)
import Parameter from "../models/parameter.js"; // Import the Parameter model (for parameter validation)
import mongoose from "mongoose";

const router = express.Router();

const validateField = (field, fieldName) => {
  if (!field) {
    return {
      code: "Bad Request",
      message: `${fieldName} is required.`,
    };
  }
  return null;
};

const validateCase = (data) => {
  const { clientName, refNumber, dateOfBreach, caseStatus, parameters } = data;

  let error = validateField(clientName, "clientName");
  if (error) return error;

  error = validateField(refNumber, "refNumber");
  if (error) return error;

  error = validateField(dateOfBreach, "dateOfBreach");
  if (error) return error;

  error = validateField(caseStatus, "caseStatus");
  if (error) return error;

  if (!parameters || parameters.length === 0) {
    return {
      code: "Bad Request",
      message: "parameters are required and must not be empty.",
    };
  }

  return null;
};



const validateParameters = async (parameters) => {
  if (parameters && parameters.length) {
    const invalidIds = parameters.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      return `The following parameter IDs are invalid: ${invalidIds.join(
        ", "
      )}`;
    }

    const validParameters = await Parameter.find({
      _id: { $in: parameters },
    });

    if (validParameters.length !== parameters.length) {
      return "One or more invalid parameters.";
    }
  }
  return null;
};

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

  const validationError = validateCase(req.body);
  if (validationError) {
    return res.status(400).json(validationError);
  }

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

  try {
    const createdByUser = await User.findOne({
      createdBy: createdBy,
      isDeleted: false,
    });
    const modifiedByUser = await User.findOne({
      modifiedBy: modifiedBy,
      isDeleted: false,
    });
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
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({
          code: "Bad Request",
          message: "The provided parentId is not a valid ObjectId.",
        });
      }

      const invalidParams = await validateParameters(parameters);
      if (invalidParams) {
        return res.status(400).json({
          code: "Bad Request",
          message: invalidParams,
        });
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
    }
  } catch (err) {
    res.status(500).json({
      code: "Internal Server Error",
      message: "An error occurred while creating the case.",
    });
  }
});

//GET: Get all cases
router.get("/", async (req, res) => {
  try {
    const cases = await Case.find({ parentId: null, isDeleted: false });
    if (cases.length === 0) {
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

//GET: Get specific case
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const case_detail = await Case.findOne({ _id: id, isDeleted: false });
    if (!case_detail) {
      return res.status(404).json({
        code: "Not Found",
        error: "Case not found.",
      });
    }
    res.status(200).json({
      code: "Success",
      message: "Case retrieved successfully.",
      data: case_detail,
    });
  } catch (err) {
    res.status(500).json({
      code: "Internal Server Error",
      message: "An error occurred while retrieving case.",
      error: err.message,
    });
  }
});

//GET: Get all the subcases of a given case.
// verify this
router.get("/:id/subcases", async (req, res) => {
  const { id } = req.params;
  try {
    const case_details = await Case.find({ _id: id, isDeleted: false });
    if (!case_details || case_details.length === 0) {
      return res.status(404).json({
        code: "Not Found",
        error: "Case not found.",
      });
    }
    const subcases = await Case.find({ parentId: id });
    res.status(200).json({
      code: "Success",
      message: "Case retrieved successfully.",
      data: subcases,
    });
  } catch (err) {
    res.status(500).json({
      code: "Internal Server Error",
      message: "An error occurred while retrieving case.",
      error: err.message,
    });
  }
});

//Patch: Update case details
//todo : add other validations
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
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
  try {
    const case_details = await Case.findOne({ _id: id, isDeleted: false });
    if (!case_details) {
      return res.status(404).json({
        code: "Not Found",
        message: "Case not found.",
      });
    }
    if(parameters) {
      const invalidParams = await validateParameters(parameters);
      if (invalidParams) {
        return res.status(400).json({
          code: "Bad Request",
          message: invalidParams,
        });
      }
    }
    case_details.parentId = parentId || case_details.parentId;
    case_details.clientName = clientName || case_details.clientName;
    case_details.refNumber = refNumber || case_details.refNumber;
    case_details.dateOfBreach = dateOfBreach || case_details.dateOfBreach;
    case_details.caseStatus = caseStatus || case_details.caseStatus;
    case_details.parameters = parameters || case_details.parameters;
    case_details.files = files || case_details.files;
    case_details.isLoi = isLoi || case_details.isLoi;
    case_details.isDeleted = isDeleted || case_details.isDeleted;
    case_details.createdBy = createdBy || case_details.createdBy;
    case_details.modifiedBy = modifiedBy || case_details.modifiedBy;
    case_details.updatedAt = new Date();


    await case_details.save();
    res.status(200).json({
      code: "Success",
      message: "User updated successfully.",
      data: case_details,
    });
  } catch (err) {
    return res.status(500).json({
      code: "Internal Server Error",
      message: "Error retrieving user.",
      error: err.message,
    });
  }
});


router.patch("/delete/:id", async (req, res) => {
  const { id } = req.params;

  const { modifiedBy } = req.body;
  try {
    const case_details = await Case.findOne({ _id: id, isDeleted: false });
    case_details.isDeleted = true;
    case_details.modifiedBy = modifiedBy || case_details.modifiedBy;
    case_details.updatedAt = new Date();
    await case_details.save();

    // Return success message if the user is successfully deleted
    res.status(200).json({
      code: "Success",
      message: "Case deleted successfully.",
      data: case_details,
    });
  } catch (err) {
    res.status(500).json({
      code: "Internal Server Error",
      message: "An error occurred while deleting the user.",
      error: err.message,
    });
  }
});

export default router;
