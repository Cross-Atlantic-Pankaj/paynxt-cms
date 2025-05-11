const mongoose = require("mongoose");

const platformSectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  clickText: { type: String },
  url: { type: String, required: true }
});

const technologyPlatformSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
  sections: [platformSectionSchema]
});

module.exports = mongoose.model("TechnologyPlatform", technologyPlatformSchema);