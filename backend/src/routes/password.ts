import express, { Request, Response } from "express";
import User from "../models/User";
import { generateRandomPassword } from "../utils/generatePassword";
import { sendEmail } from "../utils/mailer";
import bcrypt from "bcryptjs";

// Router for password related operations
const router = express.Router();

router.post("/send-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Optional: regenerate a new password each time (for security)
    const newPass = generateRandomPassword();
    const hash = await bcrypt.hash(newPass, 10);
    user.passwordHash = hash;
    await user.save();

    await sendEmail(
      email,
      "Your CampusConnect Login Password",
      `Hello ${user.name},\n\nHere is your login password:\n${newPass}\n\nPlease log in and change it immediately.\n\n- CampusConnect`
    );

    res.json({ message: "Password sent to your email" });
  } catch (err: any) {
    res.status(500).json({ message: "Error sending password", error: err.message });
  }
});

export default router;
