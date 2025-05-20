import mongoose from 'mongoose';

const ProdsliderSchema = new mongoose.Schema({
  typeText: { type: String, required: true },
  title: { type: String, required: true },
  shortDescription: { type: String },
  url: { type: String, required: true },
    createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const ProdSlider = mongoose.models.ProdSlider || mongoose.model('ProdSlider', ProdsliderSchema);

export default ProdSlider; 