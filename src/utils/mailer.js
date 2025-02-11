import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or App password
  },
});

export const sendPasswordSetupEmail = async (email, token) => {
//   const link = `http://localhost:4200/set-password?token=${token}`;
  const link = `https://medical-record-management.netlify.app//set-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Set Your Password",
    html: `<p>Click the link below to set your password:</p>
           <a href="${link}">Set Password</a>
           <p>This link will expire in 30 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password setup email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
