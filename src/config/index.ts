import dotenv from 'dotenv';
import process from 'process';
dotenv.config();

export default {
  appName: process.env.APP_NAME || 'your-app-name',
  node: process.env.NODE_ENV || 'development',
  serverPort: Number(process.env.PORT) || 8000,
  socketPort: Number(process.env.SOCKET_PORT) || 8001,
  ipAddress: process.env.IP_ADDRESS || '127.0.0.1',
  databaseUri: process.env.DATABASE_URI || '',

  saltRounds: process.env.SALT_ROUNDS || '10',

  // Email settings
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    },
    from: process.env.SMTP_MAIL,
  },
  // File upload settings
  file: {
    UploaderServices: process.env.FILE_UPLOADER || 'LOCAL',
    imageFileSizeLimit: Number(process.env.IMAGE_FILE_SIZE_LIMIT) || 5, // in MB
    videoFileSizeLimit: Number(process.env.VIDEO_FILE_SIZE_LIMIT) || 100, // in MB
    MaxFileSizeLimit: Number(process.env.MAX_FILE_SIZE_LIMIT) || 500, // in MB
    FfmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',
  },

  // AWS S3 settings
  aws: {
    bucketRegion: process.env.AWS_BUCKET_REGION,
    accessKeyId: process.env.AWS_YOUR_ACCESS_KEY,
    secretAccessKey: process.env.AWS_YOUR_SECRET_KEY,
    bucketName: process.env.AWS_S3_BUCKET_NAME,
    cloudfrontUrl: process.env.AWS_CLOUDFRONT_URL || '',
  },

  // Token settings
  tokens: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || '',
    accessTokenExpires: process.env.ACCESS_TOKEN_EXPIRES || '10',
    refreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRES || '30',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || '',
  },

  // Google OAuth2 settings
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',

  // Other settings
  clients: {
    web: {
      url: process.env.WEB_CLIENT_URL || 'http://localhost:3000',
    },
    admin: {
      url: process.env.ADMIN_CLIENT_URL || 'http://localhost:3002',
    },
  },

  // provider subscription plan service create limit
  providerServiceCreateLimit: {
    basic: Number(process.env.BASIC_PLAN_SERVICE_CREATE_LIMIT) || 0,
    standard: Number(process.env.STANDARD_PLAN_SERVICE_CREATE_LIMIT) || 0,
    premium: Number(process.env.PREMIUM_PLAN_SERVICE_CREATE_LIMIT) || 0,
  },
  providerAddCreateLimit: {
    basic: Number(process.env.BASIC_PLAN_ADD_CREATE_LIMIT) || 0,
    standard: Number(process.env.STANDARD_PLAN_ADD_CREATE_LIMIT) || 0,
    premium: Number(process.env.PREMIUM_PLAN_ADD_CREATE_LIMIT) || 0,
  },
};
