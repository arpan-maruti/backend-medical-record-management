import File from "#models/file.js";
import User from "#models/user.js";
// Function for file creation
export const createFile = async (req) => {
  try {

    const {
      fileType,
      fileFormat,
      noOfPages,
      filesLabel,
      createdBy,
      modifiedBy,
    } = req.body;

    const filePath = `/files/${req.file.filename}`;
    const fileName = req.file.originalname;

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
