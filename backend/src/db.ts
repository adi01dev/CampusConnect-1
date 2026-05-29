import mongoose from 'mongoose';
import { MONGODB_URI } from './config';

export const connectDB = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected');
};
