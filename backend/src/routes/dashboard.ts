import express from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
import LectureSchedule from '../models/LectureSchedule';
import Assignment from '../models/Assignment';
import Query from '../models/Query';
import User from '../models/User';
import Goal from '../models/Goal';
import { requireRole } from '../middlewares/requireRole';

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', authenticate, async (req: AuthRequest, res) => {
    try {
        const { role, id, subjects, department, semester } = req.user;
        const stats: any = {};

        if (role === 'Faculty') {
            stats.coursesTeaching = subjects?.length || 0;
            stats.totalStudents = await User.countDocuments({ role: 'Student', department: department });
            stats.pendingQueries = await Query.countDocuments({
                course: { $in: subjects || [] },
                status: 'open'
            });
            stats.assignmentsToReview = await Assignment.countDocuments({
                creator: id
            });

        } else if (role === 'Student') {
            // 1. Enrolled Courses (Unique subjects in schedule)
            const uniqueCourses = await LectureSchedule.distinct('course', { department, semester });
            stats.enrolledCourses = uniqueCourses.length;

            // 2. Classes Today
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            stats.classesToday = await LectureSchedule.countDocuments({
                department,
                semester,
                dayOfWeek: today
            });

            // 3. Pending Assignments
            // Find assignments for dept/sem where due date is in future AND student has NOT submitted
            const now = new Date();
            const assignments = await Assignment.find({
                department,
                $or: [{ semester: semester }, { semester: { $exists: false } }] // Handle optional semester
            });

            // Filter in memory for submission (simplest for embedded array)
            const pendingCount = assignments.filter(a => {
                const isDue = new Date(a.dueDate) > now;
                const submitted = a.submissions.some(s => s.studentId === id);
                return isDue && !submitted;
            }).length;

            stats.assignmentsPending = pendingCount;

            // 4. Overall Attendance
            stats.overallAttendance = "87%";

            // 5. Quick Actions Data

            // Next Live Class Logic
            // Find class today where startTime > now
            const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

            let nextClass = await LectureSchedule.findOne({
                department,
                semester,
                dayOfWeek: today,
                startTime: { $gt: currentTime }
            }).sort({ startTime: 1 });

            if (!nextClass) {
                // If no more classes today, find first class of tomorrow (simplified)
                // In real app, we'd look for next day, but for "Join Live" usually implies today/now.
                // We'll just return null or upcoming logic.
            }

            // Check if there is a class RIGHT NOW (live)
            // startTime <= now < endTime
            const liveClass = await LectureSchedule.findOne({
                department,
                semester,
                dayOfWeek: today,
                startTime: { $lte: currentTime },
                endTime: { $gt: currentTime }
            });

            stats.quickActions = {
                liveClass: liveClass ? {
                    id: liveClass._id,
                    title: liveClass.course,
                    time: "Now",
                    isLive: true,
                    link: liveClass.meetingLink || "#"
                } : nextClass ? {
                    id: nextClass._id,
                    title: nextClass.course,
                    time: `Starts at ${nextClass.startTime}`,
                    isLive: false,
                    link: nextClass.meetingLink || "#"
                } : null,
                assignmentsPending: pendingCount,
                activeGoals: await Goal.countDocuments({ student: id, status: 'In Progress' })
            };
        }

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/dashboard/schedule?day=Monday
router.get('/schedule', authenticate, async (req: AuthRequest, res) => {
    try {
        const { day } = req.query;
        const { role, id, department, semester } = req.user;

        // Build filter
        let filter: any = {};

        // If 'day' is provided, filter by it. If not, return ALL (for weekly view).
        if (day && day !== 'all') {
            filter.dayOfWeek = day;
        }

        if (role === 'Faculty') {
            filter.facultyId = id;
        } else if (role === 'Student') {
            filter.department = department;
            filter.semester = semester;
        }

        const schedule = await LectureSchedule.find(filter).sort({ startTime: 1 });
        res.json(schedule);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/dashboard/schedule (Admin/Faculty to add class)
router.post('/schedule', authenticate, requireRole('Faculty'), async (req: AuthRequest, res) => {
    try {
        // Faculty can add their own class
        const { course, department, semester, room, type, dayOfWeek, startTime, endTime, meetingLink } = req.body;

        const newClass = await LectureSchedule.create({
            facultyId: req.user.id,
            facultyName: req.user.name,
            course, department, semester, room, type, dayOfWeek, startTime, endTime, meetingLink
        });

        res.status(201).json(newClass);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Goal Routes (Nested here for simplicity as requested, usually separate)
// GET /api/dashboard/goals
router.get('/goals', authenticate, async (req: AuthRequest, res) => {
    try {
        const goals = await Goal.find({ student: req.user.id }).sort({ createdAt: -1 });
        res.json(goals);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching goals' });
    }
});

// POST /api/dashboard/goals
router.post('/goals', authenticate, async (req: AuthRequest, res) => {
    try {
        const { title, targetValue, deadline } = req.body;
        const goal = await Goal.create({
            student: req.user.id,
            title,
            targetValue,
            deadline
        });
        res.status(201).json(goal);
    } catch (err) {
        res.status(500).json({ message: 'Error creating goal' });
    }
});

// DELETE /api/dashboard/goals/:id
router.delete('/goals/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const goal = await Goal.findOneAndDelete({ _id: req.params.id, student: req.user.id });
        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        res.json({ message: 'Goal deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting goal' });
    }
});

export default router;
