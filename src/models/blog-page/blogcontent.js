import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  imageIconurl: { type: String, required: true },
  category: [{ type: String }],       // ← allow multiple categories
  subcategory: [{ type: String }],    // ← allow multiple subcategories
  topic: [{ type: String }],          // ← allow multiple topics
  subtopic: [{ type: String }],       // ← allow multiple subtopics
  date: { type: Date },
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  summary: { type: String },
  articlePart1: { type: String },
  articlePart2: { type: String },
  advertisement: {
    title: { type: String },
    description: { type: String },
    url: { type: String }
  }
}, { timestamps: true });

export default mongoose.models.BlogManager || mongoose.model('BlogManager', blogSchema, 'blog_manager');
