import mongoose from 'mongoose';

const productTopicSchema = new mongoose.Schema(
  {
    productTopicName: { type: String, required: true },
    generalComment: { type: String, required: false },
  },
  { timestamps: true }
);

const ProductTopic = mongoose.models.ProductTopic || mongoose.model('ProductTopic', productTopicSchema);

export default ProductTopic;