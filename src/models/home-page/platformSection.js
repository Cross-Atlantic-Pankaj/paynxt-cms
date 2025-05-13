import mongoose from 'mongoose';

const platformSectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  clickText: { type: String },
  url: { type: String, required: true }
});

const PlatformSection = mongoose.models.PlatformSection || mongoose.model('PlatformSection', platformSectionSchema);

export default PlatformSection;