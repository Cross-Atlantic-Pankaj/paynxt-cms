import mongoose from 'mongoose';

const productSubTopicSchema = new mongoose.Schema(
  {
    subProductName: { type: String, required: true },
    productTopicId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductTopic', required: true },
    generalComment: { type: String, required: false },
  },
  { timestamps: true }
);


const ProductSubTopic = mongoose.models.ProductSubTopic || mongoose.model('ProductSubTopic', productSubTopicSchema);

export default ProductSubTopic;