const mongoose = require("mongoose");

const LogoSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true }
});

module.exports = mongoose.model("Logos", LogoSchema);