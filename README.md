# Laukmand Server

Laukmand Server is a Node.js/TypeScript backend for a service-provider platform. It exposes REST APIs under `/api/v1` and runs a separate Socket.IO server for realtime features.

**Tech stack:** Node.js, TypeScript, Express, MongoDB (Mongoose), Socket.IO, JWT, Zod, Multer (local/S3), AWS SDK, Firebase Admin, Winston.

## Architecture

| Component | Location | Notes |
| --- | --- | --- |
| Server bootstrap | `src/server.ts` | Connects to MongoDB, starts Express on `PORT` and Socket.IO on `SOCKET_PORT`, initializes email transport. |
| Express app | `src/app.ts` | Security middleware (helmet, compression), CORS, cookies/JSON, static `/public`, `/api/v1` routes, global error handling. |
| Modules | `src/app/modules/*` | Feature modules with controller/service/model/route/validation files; routes aggregated in `src/app/modules/route/index.ts`. |
| Configuration | `src/config/*` | Environment loading, CORS options, Socket.IO auth, integrations. |
| Logging | `src/app/logger` | Winston with daily-rotated files in `logs/winston`. |
| File uploads | `src/middleware/fileUpload` | Local or S3 uploads selected by `FILE_UPLOADER`. |

## Project structure

```
src/
  app/
    modules/              Feature modules (auth, user, service, booking, etc.)
    ErrorHandler/         AppError and error utilities
    logger/               Winston logger setup
  config/                 Env config, CORS, socket setup, mail, AWS, Firebase
  middleware/             Express middleware and file upload helpers
  service/                Shared services (socket helpers, constants)
  DB/                     Seeder script
public/                   Static assets served by Express
dist/                     Compiled output (tsc)
```

## Setup

1. Install dependencies with your preferred package manager:
   - `npm install` (or `pnpm install` / `yarn install`)
2. Copy `.env.example` to `.env` and set the environment variables listed below.
3. Ensure MongoDB is running and reachable at `DATABASE_URI`.
4. Start the server:
   - Dev: `npm run dev`
   - Production: `npm run build` then `npm run start`

The API base URL is `http://<IP_ADDRESS>:<PORT>/api/v1` and the health check is `GET /test`.

## Environment variables

Start with `.env.example`, then add the keys below as needed. The values marked **Required** are the minimum to boot the API. The rest enable full features and better dev parity.

| Variable | Purpose | Required |
| --- | --- | --- |
| `APP_NAME` | Application name used in logs and `/test` response | No |
| `NODE_ENV` | `development` or `production` | No |
| `PORT` | Express API port | Yes |
| `SOCKET_PORT` | Socket.IO port | Yes |
| `IP_ADDRESS` | Bind address (use `127.0.0.1` for local) | Yes |
| `DATABASE_URI` | MongoDB connection string | Yes |
| `SALT_ROUNDS` | Bcrypt cost factor | No |
| `ACCESS_TOKEN_SECRET` | JWT access token secret | Yes |
| `ACCESS_TOKEN_EXPIRES` | Access token expiry (minutes) | No |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret | Yes |
| `REFRESH_TOKEN_EXPIRES` | Refresh token expiry (days) | No |
| `SMTP_HOST` | SMTP host | No |
| `SMTP_PORT` | SMTP port | No |
| `SMTP_MAIL` | SMTP username/from address | No |
| `SMTP_PASSWORD` | SMTP password/app password | No |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `FILE_UPLOADER` | `LOCAL` or `AWS` | No |
| `IMAGE_FILE_SIZE_LIMIT` | Max image size in MB | No |
| `VIDEO_FILE_SIZE_LIMIT` | Max video size in MB | No |
| `MAX_FILE_SIZE_LIMIT` | Max file size in MB | No |
| `FFMPEG_PATH` | Path to ffmpeg binary | No |
| `AWS_BUCKET_REGION` | AWS S3 bucket region | No |
| `AWS_REGION` | Region used for manual S3 URL building | No |
| `AWS_YOUR_ACCESS_KEY` | AWS access key ID | No |
| `AWS_YOUR_SECRET_KEY` | AWS secret access key | No |
| `AWS_S3_BUCKET_NAME` | S3 bucket name | No |
| `AWS_CLOUDFRONT_URL` | CloudFront base URL (optional CDN) | No |
| `WEB_CLIENT_URL` | Web client URL for CORS allowlist | No |
| `ADMIN_CLIENT_URL` | Admin client URL for CORS allowlist | No |
| `BASIC_PLAN_SERVICE_CREATE_LIMIT` | Subscription plan limits | No |
| `STANDARD_PLAN_SERVICE_CREATE_LIMIT` | Subscription plan limits | No |
| `PREMIUM_PLAN_SERVICE_CREATE_LIMIT` | Subscription plan limits | No |
| `BASIC_PLAN_ADD_CREATE_LIMIT` | Ads limits by plan | No |
| `STANDARD_PLAN_ADD_CREATE_LIMIT` | Ads limits by plan | No |
| `PREMIUM_PLAN_ADD_CREATE_LIMIT` | Ads limits by plan | No |

## Optional tools and assets

**Firebase Admin:** `src/config/firebase.ts` loads `serviceAccountKey.json` from the repository root. Replace it with your own Firebase service account file for push notifications.

**Postman collection:** `postman.json` contains example API requests.

**Database seeding:** `npm run seed` drops the database and inserts sample users from `src/DB/seeder.ts`.

