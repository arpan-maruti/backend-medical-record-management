import mongoose from 'mongoose';

// Define the user schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    maxlength: 15,
  },
  lastName: {
    type: String,
    required: true,
    maxlength: 15,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      async validator(value) {
        const user = await User.findOne({ email: value });
        return !user; // Ensure the email is not already in use
      },
      message: 'Email already in use.'
    },
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: false,
    default: null
  },
  countryCode: {
    type: String,
    required: true,
    maxlength: 7,

  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^[0-9\-\+\(\)\s]*$/, 'Please use a valid phone number']
  },
  userRole: {
    type: String,
    enum: ['user', 'admin'],
    required: true,
    default: 'user',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    required: false,
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    required: false,
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
