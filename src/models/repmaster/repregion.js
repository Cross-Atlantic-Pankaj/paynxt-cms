import mongoose from 'mongoose';

const RepRegionSchema = new mongoose.Schema(
  {
    repRegionName: { type: String, required: true },
    repCountryId: { type: mongoose.Schema.Types.ObjectId, ref: 'repFormat', required: true },
    generalComment: { type: String, required: false },
  },
  { timestamps: true }
);


const RepRegion = mongoose.models.RepRegion || mongoose.model('RepRegion', RepRegionSchema);

export default RepRegion;