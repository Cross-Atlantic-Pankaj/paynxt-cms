import mongoose from 'mongoose';

const productSubCategorySchema = new mongoose.Schema(
  {
    subProductName: { type: String, required: true },
    productCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', required: true },
    generalComment: { type: String, required: false },
  },
  { timestamps: true }
);


const ProductSubCategory = mongoose.models.ProductSubCategory || mongoose.model('ProductSubCategory', productSubCategorySchema);

export default ProductSubCategory;