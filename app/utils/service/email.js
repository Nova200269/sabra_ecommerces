import nodemailer from "nodemailer";

export async function sendEmail(targetEmail, subject, body) {
  const transporter = nodemailer.createTransport({
    host: "mail.ssg-tech.com",
    port: 587, 
    secure: false,
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_USER, 
    to: targetEmail, 
    subject: subject,
    text: body,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (e) {
    console.log(`send email error ${e}`);
  }
}
