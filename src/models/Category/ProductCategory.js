import mongoose from 'mongoose';

const productCategorySchema = new mongoose.Schema(
  {
    productCategoryName: { type: String, required: true },
    generalComment: { type: String, required: false },
  },
  { timestamps: true }
);

const ProductCategory = mongoose.models.ProductCategory || mongoose.model('ProductCategory', productCategorySchema);

export default ProductCategory;