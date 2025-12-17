import config from '..';
import { sendEmail } from './email';

// Send OTP email
export const sendOtpVerificationMail = async (
  to: string,
  otp: string,
): Promise<void> => {
  const html = generateOtpEmailTemplate(otp);
  await sendEmail(to, 'Email Verification Code', html);
};

// Generate OTP email template
const generateOtpEmailTemplate = (otp: string): string => {
  return `
    <html>
      <body>
        <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
          <h2 style="color: #007bff;">OTP Verification</h2>
          <p>Hi there,</p>
          <p>We're excited to have you onboard! To complete your registration, please use the following One-Time Password (OTP) to verify your email address:</p>
          
          <h3 style="font-size: 24px; color: #007bff; font-weight: bold;">${otp}</h3>
          
          <p>This OTP is valid for 10 minutes. If you didn't request this verification, please ignore this message.</p>
          
          <p style="font-size: 12px; color: #777;">
            For your security, never share your OTP with anyone. If you have any questions, please contact support.
          </p>
          
          <br />
          <p>Best regards,</p>
          <p>The ${config.appName || 'YourAppName'} Team</p>
        </div>
        <div> 
        <a href="https://www.linkedin.com/in/dipudebnath" style="color: #0888f0ff; font-size: 12px; text-decoration: none;"
            target="_blank">ᯤ
            Develop by ᯤ</a>
        </div>
      </body>
    </html>
  `;
};
