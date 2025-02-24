import Case from "#models/case.js";
// import Parameter from "#models/parameter.js";
export const addCaseService = async ({ parentId,
  clientName,
  refNumber,
  dateOfBreach,
  caseStatus,
  parameters,
  files,
  isLoi,
  isDeleted,
  createdBy,
  modifiedBy }) => {
  const newCase = new Case({
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
    modifiedBy
  });
  await newCase.save();
  return newCase;
}

export const getCaseService = async ({ id }) => {
  return Case.findOne({ _id: id, isDeleted: false });
}



export const updateCaseService = async (id, caseData) => {
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
  } = caseData;

  try {
    const caseDetails = await Case.findOne({ _id: id, isDeleted: false });
    if (!caseDetails) {
      throw { status: 404, code: "Not Found", message: "Case not found." };
    }

    let updates = {};

    if ('parentId' in caseData) updates.parentId = parentId;
    if ('clientName' in caseData) updates.clientName = clientName;
    if ('refNumber' in caseData) updates.refNumber = refNumber;
    if ('dateOfBreach' in caseData) updates.dateOfBreach = dateOfBreach;
    if ('caseStatus' in caseData) updates.caseStatus = caseStatus;
    if ('parameters' in caseData) updates.parameters = parameters;
    if ('isLoi' in caseData) updates.isLoi = isLoi;
    if ('isDeleted' in caseData) updates.isDeleted = isDeleted;
    if ('createdBy' in caseData) updates.createdBy = createdBy;
    if ('modifiedBy' in caseData) updates.modifiedBy = modifiedBy;
    if (files && files.length > 0) {
      updates.files = caseDetails.files.concat(files);
    }
    updates.updatedAt = new Date();

    await Case.updateOne({ _id: id, isDeleted: false }, { $set: updates });

    const updatedCase = await Case.findOne({ _id: id });
    return updatedCase;

  } catch (err) {
    throw err; // Throw the error to be handled by the controller
  }
};

export const softDeleteService = async (id, caseData) => {
  const caseDetails = await Case.find({ _id: id, isDeleted: false });
  let updates = {};
  if ('modifiedBy' in caseData) updates.modifiedBy = caseData.modifiedBy;
  updates.isDeleted = true;
  await Case.updateOne({ _id: id, isDeleted: false }, { $set: updates });
  const updatedCase = await Case.findOne({ _id: id });
  return updatedCase;
}

export const getFilesOfCaseService = async (id) => {
  const caseDetails = await Case.findOne({ _id: id, isDeleted: false }).populate("files").exec();
  return caseDetails.files;
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
    console.error("Error fetching subcases:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
}

export const getAllCasesService = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  let sortBy = req.query.sort || "-createdAt";
  const findBy = req.query.caseStatus ? { caseStatus: req.query.caseStatus } : {};
  const skip = (page - 1) * limit;

  const totalCases = await Case.countDocuments({ parentId: null, isDeleted: false, ...findBy });
  const totalPages = Math.ceil(totalCases / limit);

  if (skip >= totalCases) {
    throw new Error("This page does not exist");
  }

  if (sortBy) {
    sortBy = sortBy.split(",").join(" ");
  }

  // Fetch cases with parameters and modifiedBy populated
  const cases = await Case.find({ parentId: null, isDeleted: false, ...findBy })
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
};




    // // Filtering
    // if(req.query.caseStatus) query = query.find({caseStatus: req.query.caseStatus});