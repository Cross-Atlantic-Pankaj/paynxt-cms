import mongoose from 'mongoose';

const FeatRepoSchema = new mongoose.Schema({
  imageIconurl: { type: String, required: true },
  category: { type: String },
  blogName: { type: String, required: true },
  description: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const FeatReposSchema = new mongoose.Schema({
  mainTitle: { type: String, required: true },
  blogs: [FeatRepoSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const FeatRepo = mongoose.models.FeatRepo || mongoose.model("FeatRepo", FeatReposSchema, "Feat_Repo");

export default FeatRepo;
