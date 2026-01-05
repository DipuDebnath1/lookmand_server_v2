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
    new transports.File({
      level: level, // set the log level for file transport
      filename: path.join(logDir, folder, 'um-' + level + '.log'),
      format: combine(myFormat), // No colorization for file transport
    }),
    new DailyRotateFile({
      level: level, // set the log level for daily rotate file
      filename: path.join(logDir, folder, 'um-%DATE%-' + level + '.log'),
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(myFormat), // No colorization for file transport
    }),
  ];
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

    // Add the transport for each level dynamically
    ...createLogTransports('info', 'successes'),
    ...createLogTransports('warn', 'warns'),
    ...createLogTransports('error', 'errors'),
  ],
});
