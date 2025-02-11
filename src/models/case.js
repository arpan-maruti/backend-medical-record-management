import mongoose from "mongoose";
import User from "./user.js";
import Parameter from "./parameter.js";
import File from "./file.js";
const caseSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      default: null,
    },
    clientName: {
      type: String,
      required: true,
    },
    refNumber: {
      type: String,
      required: true,
      unique: true,
    },
    dateOfBreach: {
      type: Date,
      required: true,
    },
    caseStatus: {
      type: String,
      enum: ["uploaded", "inProgress", "aiAnalysisCompleted", "error"],
      required: true,
    },
    parameters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Parameter,
      },
    ],
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: File,
        default: [],
      },
    ],
    isLoi: {
        type: Boolean,
        default: false
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
  {
    timestamps: true,
  }
);

const Case = mongoose.model("Case", caseSchema);

export default Case;
