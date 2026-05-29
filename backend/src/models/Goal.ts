import mongoose, { Schema, Document } from 'mongoose';

export interface IGoal extends Document {
    student: mongoose.Schema.Types.ObjectId;
    title: string;
    targetValue?: string; // e.g. "A", "90%"
    currentValue?: string;
    deadline?: Date;
    status: 'In Progress' | 'Completed' | 'Missed';
    createdAt: Date;
}

const GoalSchema: Schema = new Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    targetValue: { type: String },
    currentValue: { type: String },
    deadline: { type: Date },
    status: { type: String, enum: ['In Progress', 'Completed', 'Missed'], default: 'In Progress' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IGoal>('Goal', GoalSchema);
