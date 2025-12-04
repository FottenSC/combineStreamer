/**
 * Simple logger utility that respects the NEXT_PUBLIC_ENABLE_LOGS environment variable
 * Set NEXT_PUBLIC_ENABLE_LOGS=true in .env.local to enable console logs during development
 * By default, logs are DISABLED in production for cleaner console output
 */

const isLoggingEnabled = process.env.NEXT_PUBLIC_ENABLE_LOGS === 'true';


export const logger = {
  log: (...args: any[]) => {
    if (isLoggingEnabled) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isLoggingEnabled) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors, even if logging is disabled
    console.error(...args);
  },
  info: (...args: any[]) => {
    if (isLoggingEnabled) {
      console.info(...args);
    }
  },
};
