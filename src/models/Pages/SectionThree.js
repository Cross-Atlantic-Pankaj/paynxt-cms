import mongoose from 'mongoose';

const sectionThreeSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, "Title is required"], 
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, "Description is required"], 
    trim: true 
  },
  slug: { type: String, default: null, index: true },
  image: { 
    type: String, 
    required: [true, "Image URL is required"], 
    trim: true 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const SectionThree = mongoose.models.SectionThree || mongoose.model('SectionThree', sectionThreeSchema);

export default SectionThree;