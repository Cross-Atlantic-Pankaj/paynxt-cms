const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  imageIcon: { type: String, required: true },
  productName: { type: String, required: true },
  description: { type: String },
  url: { type: String, required: true }
});

const productsSchema = new mongoose.Schema({
  mainTitle: { type: String, required: true },
  products: [productSchema]
});

module.exports = mongoose.model("Products", productsSchema);