import mongoose from 'mongoose';

const BlogBannerSchema = new mongoose.Schema({
  bannerTitle: { type: String, required: true },
  bannerDescription: { type: String },
  tags: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const BlogBanner = mongoose.models.BlogBanner || mongoose.model('BlogBanner', BlogBannerSchema);

export default BlogBanner;