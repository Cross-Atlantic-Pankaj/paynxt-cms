import mongoose from "mongoose";

const linkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  clickText: { type: String, default: '' },
  enabled: { type: Boolean, default: true }
});

const navbarSectionSchema = new mongoose.Schema({
  section: { type: String, required: true },
  sectionUrl: { type: String, default: '' },
  links: [linkSchema]
});

export default mongoose.models.NavbarSection || mongoose.model("NavbarSection", navbarSectionSchema);
