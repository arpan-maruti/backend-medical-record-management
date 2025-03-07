import Case from "#models/case.js";
import User from "#models/user.js";
import e from "express";
import { createFile } from "#services/fileService.js";
// import Parameter from "#models/parameter.js";
export const addCaseService = async ({ parentId,
  clientName,
  refNumber,
  dateOfBreach,
  caseStatus,
  parameters,
  files,
  isDeleted,
  createdBy,
  modifiedBy }) => {
  try {
    const newCase = new Case({
      parentId,
      clientName,
      refNumber,
      dateOfBreach,
      caseStatus,
      parameters,
      files,
      isDeleted,
      createdBy,
      modifiedBy
    });
    const user = await User.findOne({ _id: createdBy, isDeleted: false });
    if (!user) {
      throw new Error("User not found");
    }

    let caseLength;
    if(user.userRole==='user') {
      if(parentId){ 
         caseLength = await Case.countDocuments({parentId:null, isDeleted:false, createdBy:createdBy});
      }
      else {
         caseLength = await Case.countDocuments({parentId:parentId, isDeleted:false, createdBy:createdBy});
      }
      if(caseLength > 10){
        throw new Error("You can't create more cases.");
      }
    }
    return await newCase.save({ runValidators: true });
  } catch (err) {
    throw new Error(err.message)
  }
}

export const getCaseService = async ({ id, userId, userRole }) => {
  try {
    const query = { _id: id, isDeleted: false };

    // If the user is not an admin, restrict access to cases they created
    if (userRole === 'user') {
      query.createdBy = userId;
    }

    return await Case.findOne(query)
      .populate({
        path: 'parameters',
        populate: {
          path: 'instructionId',
          select: 'instructionMsg loiId',
          populate: {
            path: 'loiId',
            select: 'loiMsg'
          }
        }
      })
      .populate("modifiedBy", "firstName lastName")
      .populate("parentId","refNumber");
  } catch (err) {
    throw new Error(err.message);
  }
};


//think: modifiedBy
export const updateCaseService = async (id, caseData) => {
  try {
    caseData.updatedAt = new Date();
    const updatedCase = await Case.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: caseData }, { runValidators: true });
    if (!updatedCase) {
      throw new Error("Case not found");
    }
    return await Case.findOne({ _id: id });
  } catch (err) {
    throw new Error(err.message);
  }
};


export const softDeleteService = async (id, caseData) => {
  try {
    const updatedCase = await Case.findOneAndUpdate(
      { _id: id, isDeleted: false }, 
      { $set: { isDeleted: true, updatedAt: new Date() } },
      { new: true, runValidators: true }
    );
    if (!updatedCase) {
      throw new Error("Case not found");
    }

    return updatedCase;

  } catch (err) {
    throw new Error(err.message);
  }
}

export const getFilesOfCaseService = async (id) => {
  try {
    const caseDetails = await Case.findOne({ _id: id, isDeleted: false }).populate("files").exec();
    return caseDetails.files;
  } catch (err) {
    throw new Error(err.message);
  }
}

export const getSubCaseService = async ({ id }) => {
  try {
    const subCases = await Case.find({ parentId: id, isDeleted: false })
      .populate({
        path: 'parameters',
        populate: {
          path: 'instructionId',
          select: 'instructionMsg loiId',
          populate: {
            path: 'loiId',
            select: 'loiMsg'
          }
        }
      })
      .populate("parentId", "clientName")
      .populate("modifiedBy", "firstName lastName");

    return subCases;
  } catch (error) {
    throw new Error(err.message);
  }
}

export const getAllCasesService = async (req, res) => {
  try {
    let limit;
    const page = parseInt(req.query.page) || 1;
    const findBy = req.query.case_status ? { caseStatus: req.query.case_status } : {};
    const totalCases = await Case.countDocuments({ parentId: null, isDeleted: false, ...findBy });

    if (parseInt(req.query.limit) === -1) {
      limit = totalCases;
    } else {
      limit = parseInt(req.query.limit) || 5;
    }

    let sortBy = req.query.sort || "-createdAt";
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalCases / limit);

    if (skip >= totalCases) {
      throw new Error("This page does not exist");
    }

    if (sortBy) {
      sortBy = sortBy.split(",").join(" ");
    }

    // Fetch cases with parameters and modifiedBy populated
    const cases = await Case.find({ parentId: null, isDeleted: false, ...findBy })
      .collation({ locale: "en", strength: 2 }) // Enables case-insensitive sorting
      .sort(sortBy)
      .limit(limit)
      .skip(skip)
      .populate({
        path: 'parameters',
        populate: {
          path: 'instructionId',
          select: 'instructionMsg loiId',
          populate: {
            path: 'loiId',
            select: 'loiMsg'
          }
        }
      })
      .populate("modifiedBy", "firstName lastName");

    const pagination = {
      totalItems: totalCases,
      totalPages: totalPages,
      currentPage: page,
      itemsPerPage: limit,
    };

    return { cases, pagination };
  } catch (err) {
    throw new Error(err.message);
  }
};


export const createFileForCase = async (req, caseId) => {
  try {
    // Create the file
    const fileCreationResult = await createFile(req);
    const newFile = fileCreationResult.data;
    // Update the case document by adding the new file. Assumes the Case model has a "files" array field.
    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      { $push: { files: newFile._id } },
      { new: true, runValidators: true }
    );
    if (!updatedCase) {
      throw { statusCode: 404, message: "Case not found" };
    }
    return {
      message: "File created and added to case successfully.",
      file: newFile,
      case: updatedCase,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};


// // Filtering
// if(req.query.caseStatus) query = query.find({caseStatus: req.query.caseStatus});
