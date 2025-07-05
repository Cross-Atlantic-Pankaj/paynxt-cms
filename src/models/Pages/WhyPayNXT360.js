// models/Pages/WhyPayNXT360.js
import mongoose from 'mongoose';

const subSectionSchema = new mongoose.Schema({
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
  image: { 
    type: String, 
    required: [true, "Image URL is required"], 
    trim: true 
  }
}, { _id: false });

const whyPayNXT360Schema = new mongoose.Schema({
  heading: { 
    type: String, 
    required: [true, "Heading is required"], 
    trim: true 
  },
  slug: { type: String, default: null, index: true },   // ✅ single slug here (shared)
  pageTitle: String, 
  subSection1: { type: subSectionSchema, required: true },
  subSection2: { type: subSectionSchema, required: true },
  subSection3: { type: subSectionSchema, required: true },
  subSection4: { type: subSectionSchema, required: true },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const WhyPayNXT360 = mongoose.models.WhyPayNXT360 || mongoose.model('WhyPayNXT360', whyPayNXT360Schema);

export default WhyPayNXT360;
