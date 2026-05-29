import mongoose, { Schema, Document } from 'mongoose';

export interface ILectureSchedule extends Document {
    facultyId: mongoose.Schema.Types.ObjectId;
    facultyName: string;
    course: string;
    department: string;
    semester: string; // e.g., "5th Sem"
    room: string;
    type: 'Lecture' | 'Practical' | 'Tutorial' | 'Lab';
    dayOfWeek: string; // "Monday", "Tuesday", etc.
    startTime: string; // "09:00" (24h format for sorting) or "9:00 AM"
    endTime: string;
    studentsCount: number;
    meetingLink?: string;
}

const LectureScheduleSchema: Schema = new Schema({
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    facultyName: { type: String, required: true },
    course: { type: String, required: true },
    department: { type: String, required: true },
    semester: { type: String, required: true },
    room: { type: String, required: true },
    type: { type: String, enum: ['Lecture', 'Practical', 'Tutorial', 'Lab'], required: true },
    dayOfWeek: { type: String, required: true },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },
    studentsCount: { type: Number, default: 0 },
    meetingLink: { type: String }
});

export default mongoose.model<ILectureSchedule>('LectureSchedule', LectureScheduleSchema);
