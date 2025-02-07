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
    parameterMsg: {
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User, // Reference to User
      required: true,
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User, // Reference to User
      required: true,
    },
  },
  {
    timestamps: true
  }
);

const Parameter = mongoose.model("Parameter", parameterSchema);

export default Parameter;
