import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Subject from '../models/Subject';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/requireRole';
import { generateAlphanumericPassword } from '../utils/generateAlphanumeric';
import { sendEmail } from '../utils/mailer';
import { logAuditEvent } from '../utils/auditLogger';


const router = express.Router();

/**
 * @desc Get all users (Admin only)
 * @route GET /api/admin/users
 */
router.get('/users', authenticate, requireRole('Admin'), async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-passwordHash -refreshToken -resetPasswordToken');
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

/**
 * @desc Get single user by ID
 * @route GET /api/admin/users/:id
 */
router.get('/users/:id', authenticate, requireRole('Admin'), async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -refreshToken');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
});

/**
 * @desc Create Faculty or Student
 * @route POST /api/admin/users
 */
router.post('/users', authenticate, requireRole('Admin'), async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, department, semester, isMoUCoordinator, subjects } = req.body;

    if (!email || !password || !role)
      return res.status(400).json({ message: 'Email, password, and role are required' });

    // prevent duplicate
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      passwordHash,
      role,
      department,
      semester,
      isMoUCoordinator: role === 'Faculty' ? isMoUCoordinator || false : false,
      subjects: role === 'Faculty' ? subjects || [] : [],
    });

    await newUser.save();
    await logAuditEvent((req as any).user.id, 'USER_CREATED', `Admin created ${role} user: ${email} (${name})`);
    res.status(201).json({ message: `${role} created successfully`, user: newUser });
  } catch (err: any) {
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
});

/**
 * @desc Update Faculty or Student details
 * @route PUT /api/admin/users/:id
 */
router.put('/users/:id', authenticate, requireRole('Admin'), async (req: Request, res: Response) => {
  try {
    const { name, email, department, semester, isMoUCoordinator, role, subjects } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, department, semester, isMoUCoordinator, role, subjects },
      { new: true }
    ).select('-passwordHash -refreshToken');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    await logAuditEvent((req as any).user.id, 'USER_UPDATED', `Admin updated user details for: ${updatedUser.email} (${updatedUser.name})`);
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err: any) {
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
});

/**
 * @desc Delete Faculty or Student
 * @route DELETE /api/admin/users/:id
 */
router.delete('/users/:id', authenticate, requireRole('Admin'), async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await logAuditEvent((req as any).user.id, 'USER_DELETED', `Admin deleted ${user.role} user: ${user.email} (${user.name})`);
    res.json({ message: `${user.role} deleted successfully` });
  } catch (err: any) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
});

/**
 * @desc Reset user password by Admin to a random 8-character alphanumeric string and email it
 * @route POST /api/admin/users/:id/reset-password
 */
router.post('/users/:id/reset-password', authenticate, requireRole('Admin'), async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate a random 8-character alphanumeric password
    const newPass = generateAlphanumericPassword(8);
    const hash = await bcrypt.hash(newPass, 10);

    user.passwordHash = hash;
    await user.save();

    // Send the new password via email
    await sendEmail(
      user.email,
      "CampusConnect - Administrative Password Reset",
      `Hello ${user.name},\n\nYour password has been reset by an administrator.\n\nYour new random 8-digit alphanumeric login password is:\n${newPass}\n\nPlease login and change your password in the Profile Settings immediately.\n\n- CampusConnect Support`
    );

    await logAuditEvent((req as any).user.id, 'ADMIN_PASSWORD_RESET', `Admin reset password for user: ${user.email} (${user.name})`);
    res.json({ message: 'User password reset successfully and emailed' });
  } catch (err: any) {
    res.status(500).json({ message: 'Error resetting user password', error: err.message });
  }
});

/**
 * @desc Get all subjects (Authenticated only)
 * @route GET /api/admin/subjects
 */
router.get('/subjects', authenticate, async (req: Request, res: Response) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: -1 });
    res.json(subjects);
  } catch (err: any) {
    res.status(500).json({ message: 'Error fetching subjects', error: err.message });
  }
});

/**
 * @desc Create a Subject (Admin only)
 * @route POST /api/admin/subjects
 */
router.post('/subjects', authenticate, requireRole('Admin'), async (req: Request, res: Response) => {
  try {
    const { name, code, department, credits, semester } = req.body;
    if (!name || !code || !department) {
      return res.status(400).json({ message: 'Name, code, and department are required' });
    }
    const existing = await Subject.findOne({ $or: [{ name }, { code }] });
    if (existing) {
      return res.status(400).json({ message: 'Subject name or code already exists' });
    }
    const sub = await Subject.create({ name, code, department, credits: Number(credits) || 3, semester });
    res.status(201).json(sub);
  } catch (err: any) {
    res.status(500).json({ message: 'Error creating subject', error: err.message });
  }
});

/**
 * @desc Delete a Subject (Admin only)
 * @route DELETE /api/admin/subjects/:id
 */
router.delete('/subjects/:id', authenticate, requireRole('Admin'), async (req: Request, res: Response) => {
  try {
    const sub = await Subject.findByIdAndDelete(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subject not found' });
    res.json({ message: 'Subject deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: 'Error deleting subject', error: err.message });
  }
});

export default router;
