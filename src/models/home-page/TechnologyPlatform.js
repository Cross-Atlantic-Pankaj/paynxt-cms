import mongoose from 'mongoose';

const technologyPlatformSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
      createdAt: {
    type: Date,
    default: Date.now
  }
});

const TechnologyPlatform = mongoose.models.TechnologyPlatform || mongoose.model("TechnologyPlatform", technologyPlatformSchema);

export default TechnologyPlatform; 