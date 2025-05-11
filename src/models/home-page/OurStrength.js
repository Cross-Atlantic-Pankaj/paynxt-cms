const mongoose = require("mongoose");

const strengthSchema = new mongoose.Schema({
  image: { type: String, required: true },
  imageTitle: { type: String, required: true },
  description: { type: String }
});

const ourStrengthSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sections: [strengthSchema]
});

module.exports = mongoose.model("OurStrength", ourStrengthSchema);