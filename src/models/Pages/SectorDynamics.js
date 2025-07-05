// models/Pages/SectorDynamics.js
import mongoose from 'mongoose';

const sectorDynamicsSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: [true, "Text is required"], 
    trim: true 
  },
  isGlobal: { type: Boolean, default: true },
  pageTitle: { type: String, default: null },
  slug: { type: String, default: null, index: true },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const SectorDynamics = mongoose.models.SectorDynamics || mongoose.model('SectorDynamics', sectorDynamicsSchema);

export default SectorDynamics;
