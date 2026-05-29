import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { authenticate, AuthRequest } from '../middlewares/auth';
import { requireRole } from '../middlewares/requireRole';
import multer from 'multer';
import { rateLimiter } from '../middlewares/rateLimiter';
import path from 'path';
import fs from 'fs';

import Activity from '../models/Activity'; // Import Activity model
import { sendEmail } from '../utils/mailer';
import { logAuditEvent } from "../utils/auditLogger";

const router = Router();
const SALT_ROUNDS = 10;

// Configure Multer for Profile Images
const uploadDir = path.join(process.cwd(), 'uploads', 'profiles');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|avif|afif|jfif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed'));
  }
});

/**
 * POST /api/auth/profile-image
 * Upload profile picture
 */
router.post('/profile-image', authenticate, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const imageUrl = `/uploads/profiles/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imageUrl },
      { new: true }
    ).select('-passwordHash -refreshToken');

    res.json({ message: 'Profile image uploaded', profileImage: imageUrl, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post('/login', rateLimiter(50, 15 * 60 * 1000), async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ message: 'Email, role and password required' });

    const user = await User.findOne({ email, role });
    if (!user || !user.passwordHash || !role) {
      await logAuditEvent(null, "LOGIN_FAILED", `Failed login attempt for email: ${email} (User not found or role mismatch)`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      await logAuditEvent(user._id, "LOGIN_FAILED", `Failed login attempt for email: ${email} (Password incorrect)`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
      department: user.department,
      profileImage: user.profileImage
    };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ id: user._id });

    // persist refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Log Activity
    await logAuditEvent(user._id, "LOGIN_SUCCESS", `Logged in successfully with role: ${user.role}`);

    return res.json({ accessToken, refreshToken, user: payload });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/auth/refresh
 * body: { refreshToken }
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });

    let decoded: any;
    try {
      decoded = verifyRefreshToken(refreshToken) as any;
    } catch (e) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Refresh token invalidated' });
    }

    const payload = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
      department: user.department,
      profileImage: user.profileImage
    };
    const accessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken({ id: user._id });

    user.refreshToken = newRefreshToken;
    await user.save();

    return res.json({ accessToken, refreshToken: newRefreshToken, user: payload });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/auth/logout
 * body: { refreshToken }
 * invalidates refresh token in DB
 */
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });

    let decoded: any;
    try {
      decoded = verifyRefreshToken(refreshToken) as any;
    } catch {
      // even if invalid, respond OK to avoid token fishing
      return res.json({ message: 'Logged out' });
    }
    const user = await User.findById(decoded.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    return res.json({ message: 'Logged out' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/auth/me
 * Returns current user details
 */
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -refreshToken');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /api/auth/profile
 * Update current user profile details
 */
router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    // Whitelist allowed fields for update
    const allowedUpdates = [
      'phone', 'address', 'bio', 'dob', 'bloodGroup', 'gender', 'email',
      'fatherName', 'motherName', 'emergencyContact', 'profileImage',
      'department', 'subjects',
      'designation', 'experience', 'qualification', 'rating',
      'rollNumber', 'batch', 'section', 'mentor'
    ];

    const updates: any = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Email Restriction Check
    if (updates.email) {
      const currentUser = await User.findById(req.user.id);
      if (currentUser?.isEmailChanged && updates.email !== currentUser.email) {
        return res.status(400).json({ message: 'Email can only be changed once.' });
      }
      if (currentUser && updates.email !== currentUser.email) {
        updates.isEmailChanged = true;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash -refreshToken');

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Log Activity
    await Activity.create({ userId: req.user.id, action: 'PROFILE_UPDATE', description: 'Updated profile details' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Admin route to create a user
 * POST /api/auth/admin/create-user
 * body: { name, email, role, department, isMoUCoordinator, password? }
 */
router.post('/admin/create-user', authenticate, requireRole('Admin'), async (req: AuthRequest, res) => {
  try {
    const { name, email, role, department, isMoUCoordinator, password } = req.body;
    if (!name || !email || !role) return res.status(400).json({ message: 'name, email, role required' });
    if (!['Admin', 'Faculty', 'Student'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const plainPassword = password || Math.random().toString(36).slice(2, 10) + 'A1!';
    const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    const newUser = new User({
      name,
      email,
      passwordHash: hash,
      role,
      department: department || null,
      isMoUCoordinator: !!isMoUCoordinator
    });
    await newUser.save();

    // Return the plaintext initial password in the response so admin can record/send it.
    // In production, you'd email or otherwise securely deliver this.
    return res.status(201).json({ message: 'User created', user: { id: newUser._id, name, email, role }, initialPassword: plainPassword });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Authenticated route for changing password (old + new)
 * POST /api/auth/change-password
 * body: { oldPassword, newPassword }
 */
router.post('/change-password', authenticate, async (req: AuthRequest, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ message: 'oldPassword and newPassword required' });

    const user = await User.findById(req.user.id);
    if (!user || !user.passwordHash) return res.status(404).json({ message: 'User not found or has no password set' });

    const match = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Old password incorrect' });

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.passwordHash = newHash;
    await user.save();

    return res.json({ message: 'Password changed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Request password reset: creates reset token (returns token in response).
 * POST /api/auth/request-password-reset
 * body: { email }
 */
router.post('/request-password-reset', rateLimiter(30, 15 * 60 * 1000), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If account exists, reset token created (check response for token in dev)' });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpiresAt = expiresAt;
    await user.save();

    // In production: send this token via email. For local dev, we return it.
    return res.json({ message: 'Reset token generated (dev mode)', resetToken: token, expiresAt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Reset password using reset token
 * POST /api/auth/reset-password
 * body: { token, newPassword }
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'token and newPassword required' });

    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid token' });
    if (!user.resetPasswordExpiresAt || user.resetPasswordExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Token expired' });
    }

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.passwordHash = hash;
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    return res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Request OTP for forgot password
 * POST /api/auth/forgot-password
 * body: { email }
 */
router.post('/forgot-password', rateLimiter(30, 15 * 60 * 1000), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordToken = otp;
    user.resetPasswordExpiresAt = expiresAt;
    await user.save();

    // Send OTP email
    await sendEmail(
      email,
      "CampusConnect - Password Reset OTP",
      `Hello ${user.name},\n\nYour OTP to reset your password is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\n- CampusConnect Support`
    );

    return res.json({ message: 'OTP sent to your email' });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * Reset password using OTP
 * POST /api/auth/reset-password-otp
 * body: { email, otp, newPassword }
 */
router.post('/reset-password-otp', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'email, otp and newPassword required' });
    }

    const user = await User.findOne({ email, resetPasswordToken: otp });
    if (!user) return res.status(400).json({ message: 'Invalid OTP or email' });

    if (!user.resetPasswordExpiresAt || user.resetPasswordExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.passwordHash = hash;
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    return res.json({ message: 'Password updated successfully' });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * GET /api/auth/activities
 * Fetch recent user activities
 */
router.get('/activities', authenticate, async (req: AuthRequest, res) => {
  try {
    const activities = await Activity.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10);
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
