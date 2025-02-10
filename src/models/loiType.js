import mongoose from "mongoose";
import User from './user.js';
const loiTypeSchema = new mongoose.Schema({
  loiMsg: {
    type: String,
    required: true,
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
  }
}, 
{
  timestamps: true
});

const LoiType = mongoose.model("LoiType", loiTypeSchema);

export default LoiType;
