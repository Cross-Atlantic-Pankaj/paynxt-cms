import mongoose from 'mongoose';
import slugify from '@/lib/slugify'; // adjust path as needed

const relArtSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  clickText: { type: String },
  subcategory: { type: String },
  date: {
    type: String,
    default: () => dayjs().format('YYYY-MM-DD'), // ✅ stored as string
  },
  slug: { type: String, trim: true }
});

// ✅ Pre-save hook to auto-generate slug if missing
relArtSchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }

  if (!this.date) {
    this.date = new Date();
  }

  next();
});

const relart = mongoose.models.relart || mongoose.model('relart', relArtSchema);
export default relart;
