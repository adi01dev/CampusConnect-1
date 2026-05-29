import express from 'express';
import studentRoutes from './routes/student';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import { connectDB } from './db';
import authRoutes from './routes/auth';
import { PORT } from './config';
import adminRoutes from './routes/admin';
import facultyRoutes from './routes/faculty';
import queryRoutes from './routes/queryRoutes';
import facultyAttendanceRoutes from "./routes/facultyAttendance";
import studentAttendanceRoutes from "./routes/studentAttendance";
import MoURoutes from './routes/mou.routes';
import path from "path";
import materialRoutes from "./routes/material.routes";
import assignmentRoutes from "./routes/assignment.routes";
import dashboardRoutes from "./routes/dashboard";
import agentRoutes from "./routes/agent";
import chatbotRoutes from "./routes/chatbot";
import analyticsRoutes from "./routes/analytics";
import filesRoutes from "./routes/files";
import { authenticate } from "./middlewares/auth";
import { securityErrorHandler } from "./middlewares/securityErrorHandler";

dotenv.config();
const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json());

// ✅ CORS FIX
app.use(
  cors({
    origin: ['http://localhost:8080'], // your frontend URL(s)
    credentials: true,
  })
);


app.use('/api/faculty', facultyRoutes);
app.use("/api/faculty/agent", agentRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/files", filesRoutes);



app.use("/api/faculty/attendance", facultyAttendanceRoutes);
app.use("/api/student/attendance", studentAttendanceRoutes);
app.use('/api/student', studentRoutes);

app.use('/api/admin', adminRoutes);

app.use("/api/queries", queryRoutes);

app.get("/", (_, res) => {
  res.send("Student-Faculty Query API 🚀");
});

app.use("/api/mou", MoURoutes);

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});


// routes
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/assignments", assignmentRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use("/api/materials", materialRoutes);

app.use("/api/mou", MoURoutes);

app.use("/api/queries", queryRoutes);

app.get("/", (_req, res) => res.send("CampusConnect Backend Running"));


app.use('/api/auth', authRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Global Security and System Error Handler
app.use(securityErrorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
