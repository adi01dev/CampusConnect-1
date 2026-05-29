import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  code: string;
  department: string;
  credits?: number;
  semester?: string;
  createdAt: Date;
}

const SubjectSchema = new Schema<ISubject>({
  name: { type: String, required: true, unique: true, index: true },
  code: { type: String, required: true, unique: true, index: true },
  department: { type: String, required: true },
  credits: { type: Number, default: 3 },
  semester: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISubject>('Subject', SubjectSchema);
