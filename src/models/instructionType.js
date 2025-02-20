import mongoose from "mongoose";
import User from "./user.js";
import LoiType from "./loiType.js";

const instructionTypeSchema = new mongoose.Schema(
  {
    loiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: LoiType,
      required: [true, 'loi_id is required.'],
    },
    instructionMsg: {
      type: String,
      required: [true, 'instruction_msg is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: [true, 'created_by is required'],
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      default: null
    },
  },
  {
    timestamps: true
  }
);

const InstructionType = mongoose.model("InstructionType", instructionTypeSchema);

export default InstructionType;
