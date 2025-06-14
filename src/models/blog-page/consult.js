import mongoose from 'mongoose';

const ConsultSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  clickText: { type: String },
  url: { type: String, required: true }
});

const Consult = mongoose.models.Consult || mongoose.model('Consult', ConsultSchema);

export default Consult;