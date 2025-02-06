import mongoose from "mongoose";
import User from "./user.js";
import InstructionType from "./instructionType.js";

const parameterSchema = new mongoose.Schema(
  {
    instruction_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: InstructionType, // Reference to InstructionType
      required: true,
    },
    parameter_msg: {
      type: String,
      required: true,
    },
    significance_level: {
      type: String,
      enum: ["Low", "Moderate", "High"], // Enum values
      required: true,
    },
    is_deleted: {
      type: Boolean,
      default: false, // Default value is false
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User, // Reference to User
      required: true,
    },
    modified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User, // Reference to User
      required: true,
    },
    created_on: {
      type: Date,
      default: Date.now,
    },
    modified_on: {
      type: Date,
      default: Date.now,
    },
  },
);

const Parameter = mongoose.model("Parameter", parameterSchema);

export default Parameter;
