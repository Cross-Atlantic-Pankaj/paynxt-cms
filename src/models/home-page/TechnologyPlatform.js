import mongoose from 'mongoose';

const technologyPlatformSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
});

const TechnologyPlatform = mongoose.model("TechnologyPlatform", technologyPlatformSchema);

export default TechnologyPlatform; 