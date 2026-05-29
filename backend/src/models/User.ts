import mongoose, { Schema, Document } from 'mongoose';

export type Role = 'Student' | 'Faculty' | 'Admin';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: Role;
  googleId?: string;
  department?: string;
  semester?: string;
  subjects?: string[];
  isMoUCoordinator: boolean;
  isEmailChanged?: boolean;
  phone?: string;
  address?: string;
  bio?: string;
  profileImage?: string;
  dob?: string;
  bloodGroup?: string;
  gender?: string;
  fatherName?: string;
  motherName?: string;
  emergencyContact?: string;
  studentId?: string;
  rollNumber?: string;
  batch?: string;
  section?: string;
  mentor?: string;
  cgpa?: string;
  attendance?: string;
  designation?: string;
  experience?: string;
  qualification?: string;
  rating?: string;
  refreshToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpiresAt?: Date | null;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String },
  role: { type: String, enum: ['Student', 'Faculty', 'Admin'], required: true },
  googleId: { type: String },
  department: { type: String },
  semester: { type: String }, // ✅ added for Student details
  subjects: [{ type: String }], // ✅ added for Faculty (assigned by Admin)
  isMoUCoordinator: { type: Boolean, default: false },
  isEmailChanged: { type: Boolean, default: false },
  // Extended Profile Fields
  phone: { type: String },
  address: { type: String },
  bio: { type: String },
  profileImage: { type: String },
  dob: { type: String },
  bloodGroup: { type: String },
  gender: { type: String },

  // Family/Emergency
  fatherName: { type: String },
  motherName: { type: String },
  emergencyContact: { type: String },

  // Academic (Student)
  studentId: { type: String },
  rollNumber: { type: String },
  batch: { type: String }, // e.g., "2021-2025"
  section: { type: String },
  mentor: { type: String },
  cgpa: { type: String }, // or Number
  attendance: { type: String }, // e.g. "92%"

  // Professional (Faculty)
  designation: { type: String },
  experience: { type: String },
  qualification: { type: String },
  rating: { type: String },

  refreshToken: { type: String, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);
