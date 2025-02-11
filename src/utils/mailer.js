// import nodemailer from "nodemailer";
// import dotenv from "dotenv";

// dotenv.config();

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER, // Your email
//     pass: process.env.EMAIL_PASS, // Your email password or App password
//   },
// });

// export const sendPasswordSetupEmail = async (email, token) => {
//   const link = `http://localhost:4200/set-password?token=${token}`;
// //   const link = `https://medical-record-management.netlify.app//set-password?token=${token}`;

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Set Your Password",
//     html: `<p>Click the link below to set your password:</p>
//            <a href="${link}">Set Password</a>
//            <p>This link will expire in 30 minutes.</p>`,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Password setup email sent to ${email}`);
//   } catch (error) {
//     console.error("Error sending email:", error);
//   }
// };

import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
// Ensure `.env` is loaded from the correct directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Validate API key before setting it
if (
  !process.env.SENDGRID_API_KEY ||
  !process.env.SENDGRID_API_KEY.startsWith("SG.")
) {
  console.error("❌ Invalid or missing SENDGRID_API_KEY in .env file.");
  process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function to send email
export const sendEmail = async (to, subject, htmlContent) => {
  const msg = {
    to,
    from: process.env.SENDGRID_EMAIL, // Must be verified in SendGrid
    subject,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    console.error(
      "❌ Error sending email:",
      error.response?.body?.errors || error.message
    );
  }
};
// Test the function with an async wrapper
export const sendPasswordSetupEmail = async (email, token) => {
  const link = `http://localhost:4200/set-password?token=${token}`;
  const recipientEmail = email;
  const subject = "Set Your Password";
  const htmlContent = `<p>Click the link below to set your password:</p>
           <a href="${link}">Set Password</a>
            <p>This link will expire in 30 minutes.</p>`;

  await sendEmail(recipientEmail, subject, htmlContent);
};


