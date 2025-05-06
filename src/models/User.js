const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  Firstname: {
    type: String,
    required: true
  },
  Lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function () {
      return !this.linkedinId;
    }
  },
  linkedinId: {
    type: String,
    unique: true,
    sparse: true
  },
  jobTitle: {
    type: String
  },
  companyName: {
    type: String
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
        required: function () {
      return !this.linkedinId;
    }
  },
  country: {
    type: String
  },
  newsletter: {
    type: Boolean,
    default: false
  },
  termsAccepted: {
    type: Boolean,
    required: true
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
