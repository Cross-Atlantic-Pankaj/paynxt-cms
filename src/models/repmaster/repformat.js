import mongoose from 'mongoose';

const repFormatSchema = new mongoose.Schema(
  {
    repFormatName: { type: String, required: true },
    generalComment: { type: String, required: false },
  },
  { timestamps: true }
);

const repFormat = mongoose.models.repFormat || mongoose.model('repFormat', repFormatSchema);

export default repFormat;