import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';
import { connectDB } from './db';

dotenv.config();

async function seed() {
  await connectDB();

  const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@campus.local';
  const password = process.env.INITIAL_ADMIN_PASSWORD || 'AdminPass123!';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 10);
  const admin = new User({
    name: 'Initial Admin',
    email,
    passwordHash: hash,
    role: 'Admin'
  });
  await admin.save();

  console.log('✅ Admin created successfully:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
