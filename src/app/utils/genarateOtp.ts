import crypto from 'crypto';

const generateOtp = () => {
  const otp = crypto.randomInt(100000, 1000000);
  return otp.toString();
};

export default generateOtp;
