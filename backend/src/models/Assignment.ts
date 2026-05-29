import mongoose, { Document, Schema } from "mongoose";

export interface ISubmission {
  studentName: string;
  studentId: string;
  submissionText?: string;
  linkUrl?: string;
  fileUrl?: string;
  submittedAt: Date;
  grade?: number;
  feedback?: string;
}

export interface IAssignment extends Document {
  title: string;
  subject: string;
  department: string; // ✅ Target Dept
  semester?: string; // ✅ Target Semester
  faculty: Schema.Types.ObjectId; // ✅ Created by
  dueDate: string;
  totalMarks: number;
  instructions?: string;
  submissions: ISubmission[];
}

const submissionSchema = new Schema<ISubmission>({
  studentName: { type: String, required: true },
  studentId: { type: String, required: true },
  submissionText: String,
  linkUrl: String,
  fileUrl: String,
  submittedAt: { type: Date, default: Date.now },
  grade: Number,
  feedback: String
});

const assignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    department: { type: String, required: true },
    semester: { type: String },
    faculty: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    instructions: String,
    submissions: [submissionSchema],
  },
  { timestamps: true }
);

const Assignment = mongoose.model<IAssignment>("Assignment", assignmentSchema);
export default Assignment;
