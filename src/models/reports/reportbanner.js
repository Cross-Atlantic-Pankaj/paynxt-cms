import mongoose from 'mongoose';

const reptopBannerSchema = new mongoose.Schema({
  bannerTitle: { type: String, required: true },
  bannerDescription: { type: String, required: true },
  tags: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const repTopBanner = mongoose.models.repTopBanner || mongoose.model('repTopBanner', reptopBannerSchema);

export default repTopBanner;