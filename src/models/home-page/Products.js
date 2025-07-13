import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  imageIconurl: { type: String, required: true },
  productName: { type: String, required: true },
  description: { type: String },
  url: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const productsSchema = new mongoose.Schema({
  mainTitle: { type: String, required: true },
  products: [productSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Products = mongoose.models.Products || mongoose.model("Products", productsSchema);

export default Products; 