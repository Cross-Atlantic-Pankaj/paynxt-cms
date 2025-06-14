import mongoose from 'mongoose';

const relArtSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  clickText: { type: String },
  url: { type: String, required: true }
});

const relart = mongoose.models.relart || mongoose.model('relart', relArtSchema);

export default relart;