// models/home-page/PartnerLogo.js
import mongoose from 'mongoose';

const partnerLogoSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  altText: { type: String }
}, { timestamps: true });

const PartnerLogo = mongoose.models.PartnerLogo || mongoose.model('PartnerLogo', partnerLogoSchema);

export default PartnerLogo;
