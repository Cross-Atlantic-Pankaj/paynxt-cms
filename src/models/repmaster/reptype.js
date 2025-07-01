import mongoose from 'mongoose';

const repTypeSchema = new mongoose.Schema(
  {
    repTypeName: { type: String, required: true },
    generalComment: { type: String, required: false },
  },
  { timestamps: true }
);

const repType = mongoose.models.repType || mongoose.model('repType', repTypeSchema);

export default repType;