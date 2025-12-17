/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer, { SendMailOptions, Transporter } from 'nodemailer';
import config from '../../config/index';
import { logger } from '../../app/logger';

// Create transporter with proper type
const transport: Transporter = nodemailer.createTransport(config.email.smtp);

export const verifyEmailTransport = async () => {
  if (config.node === 'test') return; // skip in test environment

  try {
    await transport.verify();
    logger.info('Connected to email server');
  } catch (err: any) {
    logger.warn(
      'Unable to connect to email server. Make sure you have configured the SMTP options in .env',
    );
    logger.error('SMTP Connection Error:', err.message || err);
  }
};

// Properly type the sendEmail function
const sendEmail = async (
  to: string,
  subject: string,
  html: string,
): Promise<void> => {
  try {
    const msg: SendMailOptions = {
      from: config.email.from,
      to,
      subject,
      html,
    };
    await transport.sendMail(msg);
  } catch (err) {
    logger.error('Error sending email:', err);
  }
};

export { sendEmail, transport };
