import mongoose from "mongoose";
import User from "./user.js";

const { Schema } = mongoose;


const fileSchema = new Schema(
  {
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["loi", "document"],
      required: true,
    },
    fileFormat: {
      type: String,
      enum: ["pdf", "word"],
      required: true,
    },
    noOfPages: {
      type: Number,
      default: 0,
      required: true,
    },
    filesLabel: {
      type: String,
      default: null,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
  },
  { timestamps: true }
);

const File = mongoose.model("File", fileSchema);
export default File;
