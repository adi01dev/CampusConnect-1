import mongoose, { Document, Schema } from "mongoose";

export interface IMaterial extends Document {
  courseCode: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  downloads: number;
  views: number;
}

const MaterialSchema = new Schema<IMaterial>({
  courseCode: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true }, // Size in bytes
  uploadedBy: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  downloads: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
});

export default mongoose.model<IMaterial>("Material", MaterialSchema);
