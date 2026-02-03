import path from 'path';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '../../config';
import process from 'process';

const { combine, timestamp, label, printf } = format;

// Custom log format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const myFormat = printf(({ level, message, label, timestamp }: any) => {
  const date = new Date(timestamp);
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  const ms = date.getMilliseconds();

  return `${date.toDateString()} ${h}:${m}:${s}:${ms} [${label}] ${level}: ${message}`;
});

const logDir = path.join(process.cwd(), 'logs', 'winston');

// Utility function to generate file transports for each log level
const createLogTransports = (level: string, folder: string) => {
  return [
    new DailyRotateFile({
      level: level, // set the log level for daily rotate file
      filename: path.join(logDir, folder, 'um-%DATE%-' + level + '.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: '10d',
      format: combine(myFormat), // No colorization for file transport
    }),
  ];
};

// ✅ NEW: Combined transport for ALL log levels
const createCombinedTransport = () => {
  return new DailyRotateFile({
    level: 'info', // Captures info, warn, and error (all levels)
    filename: path.join(logDir, 'combined', 'um-%DATE%-combined.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '5d', // keep logs for 5 days
    format: combine(myFormat),
  });
};

// General logger for all log levels (info, warn, error)
export const logger = createLogger({
  level: 'info', // Default level is info (this will cover info and warn)
  format: combine(label({ label: config.appName }), timestamp(), myFormat),
  transports: [
    // Console transport for all log levels (with color)
    new transports.Console({
      level: 'info', // info and warn go to console
      format: combine(format.colorize(), myFormat),
    }),

    // Combined transport for all log levels
    createCombinedTransport(),

    // Add the transport for each level dynamically
    ...createLogTransports('info', 'successes'),
    ...createLogTransports('warn', 'warns'),
    ...createLogTransports('error', 'errors'),
  ],
});
