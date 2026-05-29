import mongoose, { Schema } from "mongoose";

const AttendanceRecordSchema = new Schema({
  session: { type: Schema.Types.ObjectId, ref: "AttendanceSession", required: true },
  student: { type: Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: String, required: true },
  markedAt: { type: Date, default: Date.now },
  scanDelay: { type: Number, required: true }, // time diff in ms
  qrId: { type: String, required: true }, // unique nonce from QR
  verificationStatus: { type: String, enum: ["verified", "late", "flagged"], default: "verified" },
});

AttendanceRecordSchema.index({ session: 1, student: 1 }, { unique: true });

export default mongoose.model("AttendanceRecord", AttendanceRecordSchema);
