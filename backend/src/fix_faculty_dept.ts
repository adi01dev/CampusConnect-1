
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from './models/User';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/campusconnect';
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

const fixFacultyData = async () => {
    await connectDB();

    try {
        // Find Faculty with missing Department
        const facultyToFix = await User.find({
            role: 'Faculty',
            $or: [{ department: { $exists: false } }, { department: null }, { department: "" }]
        });

        console.log(`Found ${facultyToFix.length} faculty members without a department.`);

        for (const faculty of facultyToFix) {
            faculty.department = "Computer Science"; // Default department
            await faculty.save();
            console.log(`Updated faculty: ${faculty.name} (${faculty.email}) -> Department: Computer Science`);
        }

        console.log('Done!');
    } catch (error) {
        console.error('Error updating users:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

fixFacultyData();
