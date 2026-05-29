import mongoose, { Schema, Document } from "mongoose";

export interface IQuery extends Document {
  studentId: mongoose.Types.ObjectId;
  facultyId: mongoose.Types.ObjectId;
  studentName: string;
  facultyName: string;
  course: string;
  category: string;
  queryText: string;
  replyText?: string;
  urgent: boolean;
  status: "pending" | "in_progress" | "resolved";
  createdAt: Date;
  repliedAt?: Date;
  replies: {
    from: string;
    message: string;
    timestamp: string;
  }[];
}

const QuerySchema = new Schema<IQuery>({
  studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  facultyId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  studentName: { type: String, required: true },
  facultyName: { type: String, required: true },
  course: { type: String, required: true },
  category: { type: String, default: "academic" },
  queryText: { type: String, required: true },
  replyText: { type: String, default: "" },
  urgent: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["pending", "in_progress", "resolved"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  repliedAt: { type: Date },
  replies: [
    {
      from: { type: String },
      message: { type: String },
      timestamp: { type: String },
    },
  ],
});

export default mongoose.model<IQuery>("Query", QuerySchema);
