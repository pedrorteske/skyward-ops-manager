/**
 * Production-safe logger that only outputs to console in development mode.
 * In production, console statements are suppressed to prevent information leakage.
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  error: (...args: unknown[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
    // In production, errors are suppressed from console
    // Could optionally send to a monitoring service like Sentry
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};
