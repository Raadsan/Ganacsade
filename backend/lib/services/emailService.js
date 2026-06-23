import nodemailer from 'nodemailer';

/**
 * Send OTP for password reset
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP code
 */
export const sendResetOTP = async (to, otp) => {
  // Configure email transporter lazily to ensure env vars are loaded
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const mailOptions = {
      from: `"GANACSADE Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Password Reset Verification Code - GANACSADE',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px;">
          <h2 style="color: #4caf50; text-align: center;">GANACSADE</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Use the following code to verify your identity:</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
          </div>
          <p>This code will expire in 10 minutes. If you did not request a password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 GANACSADE E-Commerce. All rights reserved.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};
