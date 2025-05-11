const mongoose = require("mongoose");

const sliderSchema = new mongoose.Schema({
  typeText: { type: String, required: true },
  title: { type: String, required: true },
  shortDescription: { type: String },
  url: { type: String, required: true }
});

const topBannerSchema = new mongoose.Schema({
  bannerHeading: { type: String, required: true },
  tags: [{ type: String }],
  slider: [sliderSchema]
});

module.exports = mongoose.model("TopBanner", topBannerSchema);