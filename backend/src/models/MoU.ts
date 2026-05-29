import mongoose, { Document, Schema } from "mongoose";

export interface IMoU extends Document {
  organization: string;
  type: string;
  purpose: string;
  duration: string;
  contact: string;
  benefits?: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  submittedBy: string;
  submittedDate: Date;
}

const MoUSchema = new Schema<IMoU>({
  organization: { type: String, required: true },
  type: { type: String, required: true },
  purpose: { type: String, required: true },
  duration: { type: String, required: true },
  contact: { type: String, required: true },
  benefits: { type: String, default: "" },
  status: { type: String, enum: ["pending", "under_review", "approved", "rejected"], default: "pending" },
  submittedBy: { type: String },
  submittedDate: { type: Date, default: Date.now },
});

export default mongoose.model<IMoU>("MoU", MoUSchema);
