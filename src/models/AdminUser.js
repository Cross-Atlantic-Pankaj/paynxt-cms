import mongoose from 'mongoose';

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
    enum: ['superadmin', 'editor', 'blogger'],
    default: 'blogger'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);

export default AdminUser;