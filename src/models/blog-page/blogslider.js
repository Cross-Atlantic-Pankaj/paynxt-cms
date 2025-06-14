import mongoose from 'mongoose';

const BlogsliderSchema = new mongoose.Schema({
  typeText: { type: String, required: true },
  title: { type: String, required: true },
  shortDescription: { type: String },
  url: { type: String, required: true },
    createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const BlogSlider = mongoose.models.BlogSlider || mongoose.model('BlogSlider', BlogsliderSchema);

export default BlogSlider; 