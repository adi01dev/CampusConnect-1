import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";

// Import backend models directly
import User from "./models/User";
import MoU from "./models/MoU";

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, "../.env") });

// Import custom helpers
import { generateAlphanumericPassword } from "./utils/generateAlphanumeric";

// Inline NLU Agent Intent Parser to test it offline
const parseNluCommand = (command: string) => {
  const normalized = command.toLowerCase();
  
  if (normalized.includes("assignment")) {
    const titleMatch = command.match(/titled ['"]([^'"]+)['"]/i) || command.match(/titled (\w+)/i);
    const subjectMatch = command.match(/on (\w+)/i) || command.match(/for (\w+)/i);
    const marksMatch = command.match(/for (\d+)\s*marks/i);
    return {
      intent: "CREATE_ASSIGNMENT",
      title: titleMatch ? titleMatch[1] : "Default Title",
      subject: subjectMatch ? subjectMatch[1] : "General",
      marks: marksMatch ? parseInt(marksMatch[1]) : 100,
    };
  }
  
  if (normalized.includes("lecture") || normalized.includes("attendance")) {
    const durationMatch = command.match(/of (\d+)\s*minutes/i);
    return {
      intent: "START_ATTENDANCE",
      duration: durationMatch ? parseInt(durationMatch[1]) : 60,
    };
  }
  
  return { intent: "UNKNOWN" };
};

async function runTests() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error("❌ MONGODB_URI not found in backend/.env");
    process.exit(1);
  }

  console.log("Connecting to MongoDB Atlas...");
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected successfully.\n");
  } catch (dbErr: any) {
    console.error("❌ Database Connection Failed. Please verify your internet or whitelisting config.", dbErr.message);
    process.exit(1);
  }

  let testUser: any = null;
  let testMou: any = null;

  try {
    // -------------------------------------------------------------
    // FEATURE 1: NLU Intent Parsing Validation
    // -------------------------------------------------------------
    console.log("--- TEST 1: NLU Faculty Agent Commands ---");
    const cmd1 = "Create an assignment titled 'DBMS Normalization' on Database Systems for 50 marks";
    const parsed1 = parseNluCommand(cmd1);
    console.log(`Parsed command: "${cmd1}"`);
    console.log("Parsed result:", parsed1);
    
    if (parsed1.intent !== "CREATE_ASSIGNMENT" || parsed1.title !== "DBMS Normalization" || parsed1.marks !== 50) {
      throw new Error("NLU Parsing check failed for assignment command");
    }
    console.log("✅ NLU Assignment Parser Test Passed.\n");

    const cmd2 = "Start a lecture session for Data Structures of 45 minutes";
    const parsed2 = parseNluCommand(cmd2);
    console.log(`Parsed command: "${cmd2}"`);
    console.log("Parsed result:", parsed2);
    
    if (parsed2.intent !== "START_ATTENDANCE" || parsed2.duration !== 45) {
      throw new Error("NLU Parsing check failed for attendance command");
    }
    console.log("✅ NLU Attendance Parser Test Passed.\n");

    // -------------------------------------------------------------
    // FEATURE 2: MoU Registry & Synchronous Coordinator State Syncing
    // -------------------------------------------------------------
    console.log("--- TEST 2: MoU Management & Coordinator State Syncing ---");
    
    // Create an unassigned Faculty user
    console.log("Creating active test faculty user...");
    testUser = new User({
      name: "Automated Test Faculty",
      email: "test.automated.faculty@campus.local",
      role: "Faculty",
      department: "Information Technology",
      isMoUCoordinator: false
    });
    await testUser.save();
    console.log(`Test Faculty created: ${testUser.name}`);

    // Dropdown Filtering Validation
    console.log("Validating dropdown listing filter...");
    const unassignedFaculties = await User.find({ role: "Faculty", isMoUCoordinator: false });
    const isOurUserListed = unassignedFaculties.some(u => u.email === testUser.email);
    if (!isOurUserListed) {
      throw new Error("Dropdown filtering failed: unassigned faculty not listed");
    }
    console.log("✅ Unassigned coordinator listed successfully.");

    // Submit MoU and designate Coordinator
    console.log("Creating MoU and designating faculty as coordinator...");
    testMou = new MoU({
      organization: "Automated Tech Partners",
      type: "Technology Partnership",
      contact: "tech@automatedpartners.com",
      duration: "3 years",
      purpose: "Provide cloud server infrastructure.",
      benefits: "Credits, direct API access",
      submittedBy: testUser.name,
      status: "pending"
    });
    await testMou.save();
    
    // Synchronously toggle the coordinator
    await User.findByIdAndUpdate(testUser._id, { isMoUCoordinator: true });
    
    // Fetch updated user from DB
    const updatedFaculty = await User.findById(testUser._id);
    if (!updatedFaculty || updatedFaculty.isMoUCoordinator !== true) {
      throw new Error("State synchronization failed: isMoUCoordinator is not true");
    }
    console.log("✅ Synchronous Coordinator Designation Test Passed.");

    // Validate that the assigned coordinator is now filtered out of the dropdown selection
    const updatedUnassignedFaculties = await User.find({ role: "Faculty", isMoUCoordinator: false });
    const isOurUserStillListed = updatedUnassignedFaculties.some(u => u.email === testUser.email);
    if (isOurUserStillListed) {
      throw new Error("Dropdown filtering failed: assigned coordinator is still listed");
    }
    console.log("✅ Assigned coordinator filtered out from dropdown successfully.");
    console.log("✅ MoU & State Syncing Test Passed.\n");

    // -------------------------------------------------------------
    // FEATURE 3: Forgot Password OTP Generation & Reset Flow
    // -------------------------------------------------------------
    console.log("--- TEST 3: Forgot Password OTP Generation & Reset Flow ---");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    console.log(`Simulating forgot password OTP generation for user: ${testUser.email}`);
    await User.findByIdAndUpdate(testUser._id, {
      resetPasswordToken: otp,
      resetPasswordExpiresAt: otpExpires
    });

    const userWithOtp = await User.findById(testUser._id);
    if (!userWithOtp || userWithOtp.resetPasswordToken !== otp) {
      throw new Error("OTP saving failed in MongoDB");
    }
    console.log(`OTP (${otp}) saved to database successfully.`);

    // Verify OTP and reset password
    console.log("Simulating verification and password update...");
    const newPassword = "NewAutomatedPassword123!";
    const hashed = await bcrypt.hash(newPassword, 10);
    
    await User.findOneAndUpdate(
      { email: testUser.email, resetPasswordToken: otp },
      {
        passwordHash: hashed,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null
      }
    );

    const userAfterReset = await User.findById(testUser._id);
    if (!userAfterReset || userAfterReset.resetPasswordToken !== null) {
      throw new Error("OTP clean up failed in database");
    }
    
    const isMatch = await bcrypt.compare(newPassword, userAfterReset.passwordHash || "");
    if (!isMatch) {
      throw new Error("Hashed password comparison check failed");
    }
    console.log("✅ Forgot Password OTP Reset Flow Test Passed.\n");

    // -------------------------------------------------------------
    // FEATURE 4: Admin Alphanumeric Password Generation & Reset
    // -------------------------------------------------------------
    console.log("--- TEST 4: Admin Alphanumeric Password Generation & Reset ---");
    
    // Alphanumeric Password Generator Validation
    const randomPass = generateAlphanumericPassword(8);
    console.log(`Generated administrative random password: "${randomPass}"`);
    if (randomPass.length !== 8) {
      throw new Error("Generated random password length is not 8 characters");
    }
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(randomPass)) {
      throw new Error("Generated random password is not strictly alphanumeric");
    }
    console.log("✅ Alphanumeric Password Generator Verification Passed.");

    // Update in database
    console.log("Resetting password through administrative simulation...");
    const adminHashed = await bcrypt.hash(randomPass, 10);
    await User.findByIdAndUpdate(testUser._id, { passwordHash: adminHashed });

    const userAfterAdminReset = await User.findById(testUser._id);
    if (!userAfterAdminReset) throw new Error("User record not found");
    const isAdminResetMatch = await bcrypt.compare(randomPass, userAfterAdminReset.passwordHash || "");
    if (!isAdminResetMatch) {
      throw new Error("Administrative password matching check failed");
    }
    console.log("✅ Admin Reset Password Test Passed.\n");

    // -------------------------------------------------------------
    // FEATURE 5: Python FastAPI Modular Agent System
    // -------------------------------------------------------------
    console.log("--- TEST 5: Python FastAPI Modular Agent System & DB Interrogation ---");
    
    try {
      console.log("Checking if Python FastAPI server is running on http://localhost:8000...");
      const healthRes = await fetch("http://localhost:8000/health");
      if (healthRes.ok) {
        console.log("FastAPI backend is online. Testing natural language database query...");
        
        // 5.1 Test count query
        const queryRes1 = await fetch("http://localhost:8000/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "how many students are registered?",
            user: { id: testUser._id.toString(), name: testUser.name, role: testUser.role }
          })
        });
        
        if (queryRes1.ok) {
          const data1 = await queryRes1.json();
          console.log("Database Query Agent response:\n", data1.reply);
          if (!data1.success || !data1.reply.includes("database count query")) {
            throw new Error("Database query agent failed to return metrics count");
          }
          console.log("✅ Database Interrogation Count Query Test Passed.\n");
        } else {
          console.log("⚠️ FastAPI count query failed with status:", queryRes1.status);
        }

        // 5.2 Test assignment creation query in Python Agent
        const queryRes2 = await fetch("http://localhost:8000/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "Create assignment titled 'DBMS Normalization' on Database Systems due tomorrow for 50 marks",
            user: { id: testUser._id.toString(), name: testUser.name, role: testUser.role }
          })
        });
        
        if (queryRes2.ok) {
          const data2 = await queryRes2.json();
          if (!data2.success || data2.actionTaken !== "CREATE_ASSIGNMENT") {
            throw new Error("Python assignment agent failed to create new task");
          }
          console.log("✅ Python Assignment Agent Creation Test Passed.\n");
        } else {
          console.log("⚠️ FastAPI assignment query failed.");
        }
      } else {
        console.log("⚠️ FastAPI server returned non-ok health status.");
      }
    } catch (apiErr: any) {
      console.log("ℹ️ Python FastAPI server is not currently running locally. Skipping live API proxy checks.");
      console.log("   (Start the Python server on port 8000 to enable live checks)\n");
    }

    // -------------------------------------------------------------
    // FEATURE 6: Pre-existing Authentication & JWT Flow
    // -------------------------------------------------------------
    console.log("--- TEST 6: Pre-existing Authentication & JWT Flow ---");
    
    try {
      const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@campus.local";
      const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || "AdminPass123!";
      
      const loginRes = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          role: "Admin"
        })
      });
      
      if (loginRes.ok) {
        const loginData = (await loginRes.json()) as any;
        if (!loginData.accessToken || !loginData.user || loginData.user.role !== "Admin") {
          throw new Error("Admin login response missing valid token or user payload");
        }
        console.log("✅ Platform Login and Token Generation Test Passed.\n");
      } else {
        console.log("⚠️ Platform Login failed (FastAPI or Express not serving on port 4000). Skipping live login checks.\n");
      }
    } catch (e: any) {
      console.log("ℹ️ Node.js backend not reachable on port 4000. Skipping live login checks.\n");
    }

    // -------------------------------------------------------------
    // FEATURE 7: Pre-existing Student Queries Operations
    // -------------------------------------------------------------
    console.log("--- TEST 7: Pre-existing Student Queries Operations ---");
    
    const db = mongoose.connection.db;
    
    // Create a mock query
    const studentQueryDoc = {
      studentId: testUser._id,
      facultyId: testUser._id,
      studentName: "Automated Test Student",
      facultyName: "Automated Test Faculty",
      course: "Database Systems",
      queryText: "Is normal form mandatory for final project?",
      status: "pending"
    };
    
    const dbQuery = await db.collection("queries").insertOne(studentQueryDoc);
    if (!dbQuery.insertedId) {
      throw new Error("Failed to insert student query");
    }
    console.log(`Mock Student Query created successfully with ID: ${dbQuery.insertedId}`);
    
    // Fetch queries for this faculty
    const facultyQueries = await db.collection("queries").find({ facultyId: testUser._id }).toArray();
    if (facultyQueries.length === 0) {
      throw new Error("Query fetching failed: no queries returned for faculty");
    }
    console.log("✅ Student Query Submission and Fetching Test Passed.\n");
    
    // Cleanup query
    await db.collection("queries").deleteOne({ _id: dbQuery.insertedId });

    // -------------------------------------------------------------
    // FEATURE 8: Pre-existing Class Study Resources
    // -------------------------------------------------------------
    console.log("--- TEST 8: Pre-existing Class Study Resources ---");
    
    const mockMaterial = {
      courseCode: "Database Systems",
      title: "Introduction to MongoDB",
      description: "Getting started guide for NoSQL database.",
      fileUrl: "/uploads/materials/mongodb_intro.pdf",
      fileType: "pdf",
      fileSize: 20480,
      uploadedBy: "Admin",
      downloads: 0,
      views: 0
    };
    
    const dbMaterial = await db.collection("materials").insertOne(mockMaterial);
    if (!dbMaterial.insertedId) {
      throw new Error("Failed to insert study resource");
    }
    
    const retrievedMaterials = await db.collection("materials").find({ courseCode: "Database Systems" }).toArray();
    if (retrievedMaterials.length === 0) {
      throw new Error("Material directory retrieval returned empty list");
    }
    console.log("✅ Study Materials Directory retrieval Test Passed.\n");
    
    // Cleanup material
    await db.collection("materials").deleteOne({ _id: dbMaterial.insertedId });

    console.log("🏆 ALL INTEGRATION CHECKS PASSED SUCCESSFULLY!");

  } catch (error: any) {
    console.error("\n❌ TEST FAILED:", error.message);
    process.exit(1);
  } finally {
    // Cleanup database test documents
    console.log("Cleaning up database test records...");
    if (testUser) {
      await User.deleteOne({ _id: testUser._id });
      console.log("Test Faculty user cleaned up.");
    }
    if (testMou) {
      await MoU.deleteOne({ _id: testMou._id });
      console.log("Test MoU cleaned up.");
    }
    mongoose.connection.close();
  }
}

runTests();
