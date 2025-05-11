const mongoose = require("mongoose");

const insightsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String, required: true },
  ctaUrl: { type: String, required: true }
});

module.exports = mongoose.model("Insights", insightsSchema);