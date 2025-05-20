import mongoose from 'mongoose';

const ProdtopBannerSchema = new mongoose.Schema({
  bannerHeading: { type: String, required: true },
  tags: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const ProdTopBanner = mongoose.models.ProdTopBanner || mongoose.model('ProdTopBanner', ProdtopBannerSchema);

export default ProdTopBanner;