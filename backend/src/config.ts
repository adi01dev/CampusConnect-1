import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect';
export const JWT_SECRET = process.env.JWT_SECRET || 'secret';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refreshsecret';
export const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

