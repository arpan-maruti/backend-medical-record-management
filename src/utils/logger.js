import { createLogger, format, transports } from "winston";
import winston from "winston";
const { combine, timestamp, json, colorize, errors } = format;

// Custom format for console logging with colors
const consoleLogFormat = format.combine(
  format.colorize(),
  format.printf(({ level, message, timestamp }) => {
    return `${level}: ${message}`;
  })
);

// Create a Winston logger
const logger = createLogger({
  level: "info",
  format: combine(colorize(), timestamp(), errors({ stack: true }), json()),
  transports: [
    new transports.File({ filename: "app.log" }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'exception.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'rejections.log' }),
  ],
});
// logger.error('Something went wrong');
// logger.rejections.handle({
//   level: "error",
//   format: combine(colorize(), timestamp(), json()),
//   rejectionHandlers: [
//     new transports.File({ filename: 'rejections.log' }),
//     new transports.Console({
//       format: consoleLogFormat,
//     }),
//   ]
// });

export default logger;