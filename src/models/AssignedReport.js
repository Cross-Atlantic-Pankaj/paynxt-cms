import mongoose, { Schema } from 'mongoose';

const AssignedReportSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reportId: { type: Schema.Types.ObjectId, required: true, index: true }, // keep generic; ref optional
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // optional (admin who assigned)
    source: { type: String, enum: ['cms', 'purchase'], default: 'cms' },   // optional
  },
  { timestamps: true }
);

// prevent duplicates
AssignedReportSchema.index({ userId: 1, reportId: 1 }, { unique: true });

export default mongoose.models.AssignedReport ||
  mongoose.model('AssignedReport', AssignedReportSchema);
