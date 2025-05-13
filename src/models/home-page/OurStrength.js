import mongoose from 'mongoose';

const strengthSchema = new mongoose.Schema({
  image: { type: String, required: true },
  imageTitle: { type: String, required: true },
  description: { type: String },
    createdAt: {
    type: Date,
    default: Date.now
  }
});

const ourStrengthSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sections: [strengthSchema],
    createdAt: {
    type: Date,
    default: Date.now
  }
});

const OurStrength = mongoose.models.OurStrength || mongoose.model('OurStrength', ourStrengthSchema);

export default OurStrength;