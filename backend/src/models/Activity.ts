import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
    userId: mongoose.Types.ObjectId;
    action: string;
    description?: string;
    createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g., 'LOGIN', 'PROFILE_UPDATE'
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IActivity>('Activity', ActivitySchema);
