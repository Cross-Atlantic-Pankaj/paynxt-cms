import mongoose from 'mongoose';

const keyStatisticsSchema = new mongoose.Schema({
  title: { type: String, required: [true, "Title is required"], trim: true },
  description: { type: String, required: [true, "Description is required"], trim: true },
  slug: { type: String, default: null, index: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const KeyStatistics = mongoose.models.KeyStatistics || mongoose.model('KeyStatistics', keyStatisticsSchema);

export default KeyStatistics;
