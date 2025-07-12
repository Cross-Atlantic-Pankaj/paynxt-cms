// models/Order.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // optional if guest checkout
  items: [
    {
      title: String,
      price: Number,
      summary: String
    }
  ],
  billingDetails: {
    company: String,
    firstName: String,
    lastName: String,
    email: String,
    address1: String,
    address2: String,
    city: String,
    zipcode: String,
    country: String,
    state: String
  },
  totalPrice: Number,
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' }
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
