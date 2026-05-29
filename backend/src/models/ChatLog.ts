import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage {
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
  intent?: string;
  redirectUrl?: string;
  actionLabel?: string;
}

export interface IChatLog extends Document {
  userId: mongoose.Types.ObjectId;
  role: "Student" | "Faculty" | "Admin";
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  sender: { type: String, enum: ["user", "assistant"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  intent: { type: String },
  redirectUrl: { type: String },
  actionLabel: { type: String }
});

const ChatLogSchema = new Schema<IChatLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  role: { type: String, enum: ["Student", "Faculty", "Admin"], required: true },
  messages: [ChatMessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model<IChatLog>("ChatLog", ChatLogSchema);
