import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    console.log(`Sending email to ${to} with subject: ${subject}`);
    const info = await transporter.sendMail({
      from: `"CampusConnect Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });
    console.log("Email sent successfully: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

