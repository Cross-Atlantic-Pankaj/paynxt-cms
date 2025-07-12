import mongoose from 'mongoose';

const EmailTemplateSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true }, // e.g., 'order_success'
  subject: { type: String, required: true },            // e.g., 'Payment Successful!'
  body: { type: String, required: true }                // e.g., 'Hello {{firstName}}, you paid ${{totalPrice}}...'
}, {
  timestamps: true
});

// Avoid re-registering model when hot-reloading in dev
export default mongoose.models.EmailTemplate || mongoose.model('EmailTemplate', EmailTemplateSchema);
