import mongoose from 'mongoose';

const sliderSchema = new mongoose.Schema({
  typeText: { type: String, required: true },
  title: { type: String, required: true },
  shortDescription: { type: String },
  url: { type: String, required: true },
    createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Slider = mongoose.models.Slider || mongoose.model('Slider', sliderSchema);

export default Slider; 