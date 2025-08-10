import mongoose from 'mongoose';

const RepSubRegionSchema = new mongoose.Schema(
  {
    repSubRegionName: { type: String, required: true },
    repSubCountryId: { type: mongoose.Schema.Types.ObjectId, ref: 'repType', required: true },
    generalComment: { type: String, required: false },
  },
  { timestamps: true }
);


const RepSubRegion = mongoose.models.RepSubRegion || mongoose.model('RepSubRegion', RepSubRegionSchema);

export default RepSubRegion;