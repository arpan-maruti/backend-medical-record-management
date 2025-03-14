import mongoose from "mongoose";
import User from "#models/user.js";
import Parameter from "#models/parameter.js";
import File from "#models/file.js";
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
  {
    timestamps: true,
  }
);

const Case = mongoose.model("Case", caseSchema);

export default Case;
