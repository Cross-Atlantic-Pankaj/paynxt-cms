import mongoose from 'mongoose';

const ConsultSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  clickText: { type: String },
  url: { type: String, required: true }
});

const Consultsec = mongoose.models.Consultsec || mongoose.model('Consultsec', ConsultSchema);

export default Consultsec;