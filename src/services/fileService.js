import File from "#models/file.js";

import Case from "#models/case.js";

// Function for file creation
export const createFile = async (req) => {
  try {
    const {
      fileType,
      fileFormat,
      filesLabel,
      createdBy,
      modifiedBy,
      fileName,
      filePath,
      fileSize
    } = req.body;

    const newFile = new File({
      fileName,
      filePath,
      fileType,
      fileFormat,
      filesLabel,
      createdBy,
      modifiedBy,
      fileSize
    });

    await newFile.save({ runValidators: true });

    return {
      code: "Created",
      message: "File created successfully.",
      data: newFile,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

export const getFile = async (fileId) => {
  try {
    const fileData = await File.findById(fileId)
    .populate("createdBy", "firstName lastName")
    .populate("modifiedBy", "firstName lastName");
    if (!fileData) {
      throw new Error("File not found");
    }
    return fileData;
  } catch (err) {
    throw new Error(err.message);
  }
};

export const patchFile = async (fileId, updateData) => {
  try {
    const updatedFile = await File.findByIdAndUpdate(fileId, updateData, {
      new: true,
      runValidators: true
    });
    if (!updatedFile) {
      throw new Error("File not found");
    }
    return updatedFile;
  } catch (err) {
    throw new Error(err.message);
  }
};

//fix:Update this api
export const deleteFile = async (fileId) => {
  try {
    const deletedFile = await File.findByIdAndDelete(fileId);
    if (!deletedFile) {
      throw {
        statusCode: 404,
        message: "File not found",
      };
    }

    const updatedCase = await Case.updateMany(
      { file: fileId },
      { $pull: { file: fileId } }
    );

    if (updatedCase.nModified === 0) {
      throw {
        statusCode: 404,
        message: "Case not found with this file reference",
      };
    }

    return {
      message: "File deleted and reference removed from case",
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

export const updateFileLabel = async (fileId, newLabel) => {
  try {
    const updatedFile = await File.findByIdAndUpdate(
      fileId,
      { filesLabel: newLabel },
      { new: true, runValidators: true }
    );
    if (!updatedFile) {
      throw new Error("Error while updating file");
    }
    return updatedFile;
  } catch (err) {
    throw new Error(err.message);
  }
};