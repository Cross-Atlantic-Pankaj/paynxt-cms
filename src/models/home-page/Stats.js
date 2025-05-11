const mongoose = require("mongoose");

const statSchema = new mongoose.Schema({
  title: { type: String, required: true },
  statText: { type: String, required: true },
  description: { type: String }
});

const statsSectionSchema = new mongoose.Schema({
  stats: [statSchema]
});

module.exports = mongoose.model("Stats", statsSectionSchema);