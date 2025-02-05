import mongoose from "mongoose";
import User from './user.js';
const loiTypeSchema = new mongoose.Schema({
  loi_msg: {
    type: String,
    required: true,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  modified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
});

const LoiType = mongoose.model("LoiType", loiTypeSchema);

export default LoiType;
