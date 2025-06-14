import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: String,
  summary: String,
  articlePart1: String,
  articlePart2: String,
  advertisement: {
    title: String,
    description: String,
    url: String
  }
}, { timestamps: true });

// 👇 Give it a UNIQUE model name and explicit collection name
export default mongoose.models.BlogManager || mongoose.model('BlogManager', blogSchema, 'blog_manager');
