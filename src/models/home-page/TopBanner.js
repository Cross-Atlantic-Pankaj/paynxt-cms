import mongoose from 'mongoose';

const topBannerSchema = new mongoose.Schema({
  bannerHeading: { type: String, required: true },
  image: { type: String, required: true },
  tags: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const TopBanner = mongoose.models.TopBanner || mongoose.model('TopBanner', topBannerSchema);

export default TopBanner;