import express from "express";
import Case from "../models/case.js"; // Import the Case model
import User from "../models/user.js"; // Import the User model (to validate userId)
import Parameter from "../models/parameter.js"; // Import the Parameter model (for parameter validation)
import mongoose from "mongoose";
import File from "../models/file.js";
import * as caseController from '../controllers/caseController.js';
const router = express.Router();
import passport from "passport";
import roleMiddleware from "../middlewares/roleMiddlewares.js";

// Controllers
const validateCase = (req, res, next) => {
  const error = [];
  const { clientName, refNumber, dateOfBreach, caseStatus, parameters } = req.body;
  if (!clientName) error.push("clientName ");
  if (!refNumber) error.push("refNumber ");
  if (!dateOfBreach) error.push("dateOfBreach ");
  if (!caseStatus) error.push("caseStatus ");
  if (!parameters || parameters.length === 0) error.push("parameters ");
  if (error.length > 0) {
    return res.status(400).json({
      code: "Bad Request",
      message: `${error}: are required.`
    })
  }
  next();
};
const validateParameters = async (req, res, next) => {
  const { parameters } = req.body;
  if (parameters && parameters.length) {
    const invalidIds = parameters.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      return res.status(400).json({
        code: "Bad Request",
        message: `${invalidIds} are invlaid.`,
      });
    }

    const validParameters = await Parameter.find({
      _id: { $in: parameters },
    });

    if (validParameters.length !== parameters.length) {
      return res.status(400).json({
        code: "Bad Request",
        message: invalidParams,
      });
    }
  }
  next();
};

const getAllCases = async (req, res) => {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;
    let query = Case.find({ parentId: null, isDeleted: false });
    if(limit === -1) {
      const cases = await query;
      return res.status(200).json({
        code: "Success",
        length: cases.length,
        message: "All cases fetched successfully.",
        data: cases,
      });
    }
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    const totalCases = await Case.countDocuments({parentId: null, isDeleted:false});
    const totalPages = Math.ceil(totalCases / limit);
    if(skip > totalCases) throw new Error("This page does not exist");

    const cases = await query;

    if (cases.length === 0) {
      return res.status(200).json({
        code: "Success",
        message: "No cases found.",
        data: [],
        pagination: {
          totalItems: totalCases,
          totalPages: totalPages,
          currentPage: page,
          itemsPerPage: limit,
        },
      });
    }
    res.status(200).json({
      code: "Success",
      length: cases.length,
      message: "All cases fetched successfully.",
      data: cases,
      pagination: {
        totalItems: totalCases,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch(err) {
    res.status(500).json({
      code: "Internal Server Error",
      message: "An error occurred while fetching the cases.",
      error:err
    });
  }
}

// const getAllCases = async (req, res) => {
//   try {
//     console.log(req.query);

//     const cases = await Case.find({ parentId: null, isDeleted: false });
//     if (!cases) {
//       return res.status(200).json({
//         code: "Success",
//         message: "No cases found.",
//         data: [],
//       })
//     }
//     res.status(200).json({
//       code: "Success",
//       length: cases.length,
//       message: "All cases fetch successfully",
//       data: cases
//     })
//   } catch (err) {
//     res.status(500).json({
//       code: "Internal Server Error",
//       message: "An error occurred while fetching the cases.",
//     })
//   }

// }


// Routes
// POST: Create a new case
router.post("/", passport.authenticate('jwt', { session: false }), roleMiddleware(['user','admin']),validateCase, validateParameters, caseController.addCase);

//GET: Get all cases
router.get("/",passport.authenticate('jwt', { session: false }), roleMiddleware(['user','admin']), caseController.getAllCases);

//GET: Get specific case
router.get("/:id",passport.authenticate('jwt', { session: false }), roleMiddleware(['user','admin']), caseController.getCase);

//GET: Get all the subcases of a given case.
router.get("/:id/subcases", passport.authenticate('jwt', { session: false }), roleMiddleware(['user','admin']),caseController.fetchSubacaseOfCase);

//Patch: Update case details
//todo : add other validations
router.patch("/:id", passport.authenticate('jwt', { session: false }), roleMiddleware(['admin']),validateParameters, caseController.updateCase);

//PATCH : Soft-delete case
router.patch("/delete/:id", passport.authenticate('jwt', { session: false }), roleMiddleware(['admin']),caseController.softDelete);

//GET: Get all the files of particular case
router.get("/:id/file",passport.authenticate('jwt', { session: false }), roleMiddleware(['user','admin']), caseController.getFilesOfCase);

router.get("/:id/cases",passport.authenticate('jwt', { session: false }), roleMiddleware(['user','admin']), caseController.fetchCasesofUser);

export default router;
