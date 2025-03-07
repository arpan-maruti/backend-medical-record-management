import mongoose from "mongoose";
import User from "#models/user.js";

const { Schema } = mongoose;

const fileSchema = new Schema(
  {
    fileName: {
      type: String,
      required: [true, 'file_name is required']
    },
    filePath: {
      type: String,
      required: [true, 'file_path is required'],
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    fileType: {
      type: String,
      enum: {
        values: ["loi", "document"],
        message: `{VALUE} is not supported.`
      },
      required: true,
    },
    fileFormat: {
      type: String,
      enum: {
        values: ["pdf", "word"],
        message: `{VALUE} is not supported.`
      },
      required: true,
    },
    noOfPages: {
      type: Number,
      default: 0,
    },
    filesLabel: {
      type: String,
      default: null,
    },
    fileStatus: {
      type: String,
      enum: {
        values: ["uploaded", "in progress", "AI Analysis Completed", "error"],
        message: `{VALUE} is not supported.`
      },
      default: "uploaded",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: [true, 'created_by is required'],
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: [true, 'modified_by is required'],
    },
  },
  { timestamps: true }
);

const File = mongoose.model("File", fileSchema);
export default File;