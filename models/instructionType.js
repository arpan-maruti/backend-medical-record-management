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
    instructionMsg: {
      type: String,
      required: true,
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

const InstructionType = mongoose.model("InstructionType", instructionTypeSchema);

export default InstructionType;
