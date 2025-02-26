import File from "#models/file.js";
import User from "#models/user.js";
// Function for file creation
export const createFile = async (req) => {
  const {
    fileType,
    fileFormat,
    noOfPages,
    filesLabel,
    createdBy,
    modifiedBy,
  } = req.body;

  // Validate fileType and fileFormat values
  const validFileTypes = File.schema.path('fileType').enumValues;
  if (!validFileTypes.includes(fileType)) {
    throw {
      statusCode: 400,
      code: "Bad Request",
      message: `Invalid fileType. Allowed values are: ${validFileTypes.join(", ")}`,
    };
  }

  const validFileFormats = File.schema.path('fileFormat').enumValues;
  if (!validFileFormats.includes(fileFormat)) {
    throw {
      statusCode: 400,
      code: "Bad Request",
      message: `Invalid fileFormat. Allowed values are: ${validFileFormats.join(", ")}`,
    };
  }

  const filePath = `/files/${req.file.filename}`;
  const fileName = req.file.originalname;

  // Validate user existence
  const createdByUser = await User.findById(createdBy);
  const modifiedByUser = await User.findById(modifiedBy);

  if (!createdByUser || !modifiedByUser) {
    throw {
      statusCode: 400,
      code: "Bad Request",
      message: "Invalid userId provided in createdBy or modifiedBy.",
    };
  }

  // Create a new file object and save to DB
  const newFile = new File({
    fileName: fileName,
    filePath,
    fileSize: req.file.size,
    fileType,
    fileFormat,
    noOfPages,
    filesLabel,
    createdBy,
    modifiedBy,
  });

  await newFile.save();

  return {
    code: "Created",
    message: "File created successfully.",
    data: newFile,
  };
};

// Function for deleting a file
export const deleteFile = async (fileId) => {
  // Step 1: Delete the file from the File collection
  const deletedFile = await File.findByIdAndDelete(fileId);
  if (!deletedFile) {
    throw {
      statusCode: 404,
      message: "File not found",
    };
  }

  // Step 2: Remove the file reference from the Case collection
  const updatedCase = await Case.updateMany(
    { file: fileId },
    { $pull: { file: fileId } }
  );

  // Check if the case was updated
  if (updatedCase.nModified === 0) {
    throw {
      statusCode: 404,
      message: "Case not found with this file reference",
    };
  }

  return {
    message: "File deleted and reference removed from case",
  };
};


export const updateFileLabel = async (fileId, newLabel) => {
  const updatedFile = await File.findByIdAndUpdate(
    fileId,
    { filesLabel: newLabel },
    { new: true, runValidators: true }
  );
  if (!updatedFile) {
    throw {
      statusCode: 404,
      code: "Not Found",
      message: "File not found",
    };
  }
  return updatedFile;
};
