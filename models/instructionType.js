import mongoose from "mongoose";
import User from "./user.js";
import LoiType from "./loiType.js";

const instructionTypeSchema = new mongoose.Schema(
  {
    loi_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: LoiType, // Reference to LoiType
      required: true,
    },
    instruction_msg: {
      type: String,
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
  },
  {
    timestamps: true
  }
);

const InstructionType = mongoose.model("InstructionType", instructionTypeSchema);

export default InstructionType;
