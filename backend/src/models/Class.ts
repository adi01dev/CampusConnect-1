import mongoose, { Schema } from 'mongoose';

const ClassSchema = new Schema({
  faculty: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseName: { type: String, required: true },
  room: { type: String },
  type: { type: String, enum: ['Lecture','Practical','Tutorial','Lab'], default: 'Lecture' },
  scheduleDateTime: { type: Date, required: true },
  studentsCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Class', ClassSchema);
