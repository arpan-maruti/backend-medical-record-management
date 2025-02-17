import mongoose from "mongoose";
import User from "./user.js";
import InstructionType from "./instructionType.js";

const parameterSchema = new mongoose.Schema(
  {
    instructionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: InstructionType,
      required: [true, 'instruction_id is required'],
    },
    parameterMsg: {
      type: String,
      required: [true, 'parameter_msg is required'],
    },
    significanceLevel: {
      type: String,
      enum: ["Low", "Moderate", "High"],
      required: true,
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
  {
    timestamps: true
  }
);

const Parameter = mongoose.model("Parameter", parameterSchema);

export default Parameter;
