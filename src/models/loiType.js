import mongoose from "mongoose";
import User from './user.js';
const loiTypeSchema = new mongoose.Schema({
  loiMsg: {
    type: String,
    required: [true, 'loi_msg is required'],
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
  }
}, 
{
  timestamps: true
});

const LoiType = mongoose.model("LoiType", loiTypeSchema);

export default LoiType;
