import mongoose from 'mongoose';

const statSchema = new mongoose.Schema({
  title: { type: String, required: true },
  statText: { type: String, required: true },
  description: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Stats = mongoose.models.Stats || mongoose.model("Stats", statSchema);

export default Stats; 