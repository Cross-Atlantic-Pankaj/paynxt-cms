const mongoose = require('mongoose');

const AdminUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  isAdminPanelUser: {
    type: Boolean,
    default: false 
  },

  role: {
    type: String,
    enum: ['superadmin', 'editor', 'viewer'],
    default: 'viewer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);
