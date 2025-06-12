import mongoose from 'mongoose';

const ViewtopBannerSchema = new mongoose.Schema({
  bannerTitle: { type: String, required: true },
  bannerDescription: { type: String, required: true },
  tags: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const ViewTopBanner = mongoose.models.ViewTopBanner || mongoose.model('ViewTopBanner', ViewtopBannerSchema);

export default ViewTopBanner;