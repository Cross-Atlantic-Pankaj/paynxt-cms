import mongoose from 'mongoose';

const ViewsliderSchema = new mongoose.Schema({
  typeText: { type: String, required: true },
  title: { type: String, required: true },
  shortDescription: { type: String },
  url: { type: String, required: true },
    createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const ViewSlider = mongoose.models.ViewSlider || mongoose.model('ViewSlider', ViewsliderSchema);

export default ViewSlider; 