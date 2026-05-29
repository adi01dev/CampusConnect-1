import mongoose, { Schema } from 'mongoose';

const PerformanceSchema = new Schema({
  faculty: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: String, required: true },
  attendancePercentage: { type: Number, default: 0 },
  avgScore: { type: Number, default: 0 },
  assignmentsCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Performance', PerformanceSchema);
