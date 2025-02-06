import mongoose from "mongoose";
import User from "./user.js";
import LoiType from "./loiType.js";

const instructionTypeSchema = new mongoose.Schema(
  {
    instruction_msg: {
      type: String,
      required: true,
    },
    loi_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: LoiType, // Reference to LoiType
      required: true,
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

const InstructionType = mongoose.model("InstructionType", instructionTypeSchema);

export default InstructionType;
