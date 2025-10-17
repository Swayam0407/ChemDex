/**
 * Logging utility for the application
 * Requirements: 7.3, 7.4
 */

const fs = require('fs');
const path = require('path');

/**
 * Log levels
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

/**
 * Logger class
 */
class Logger {
  constructor() {
    this.logLevel = this.getLogLevel();
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  /**
   * Get log level from environment
   */
  getLogLevel() {
    const level = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    return LOG_LEVELS[level] !== undefined ? LOG_LEVELS[level] : LOG_LEVELS.INFO;
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      try {
        fs.mkdirSync(this.logDir, { recursive: true });
      } catch (error) {
        console.error('Failed to create log directory:', error.message);
      }
    }
  }

  /**
   * Format log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };

    return JSON.stringify(logEntry);
  }

  /**
   * Write log to file
   */
  writeToFile(level, formattedMessage) {
    if (process.env.NODE_ENV === 'test') {
      return; // Don't write logs during testing
    }

    try {
      const filename = level === 'ERROR' ? 'error.log' : 'app.log';
      const filepath = path.join(this.logDir, filename);
      
      fs.appendFileSync(filepath, formattedMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  /**
   * Log to console with colors
   */
  logToConsole(level, message, meta = {}) {
    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[37m'  // White
    };
    
    const reset = '\x1b[0m';
    const timestamp = new Date().toISOString();
    
    const colorCode = colors[level] || colors.DEBUG;
    const prefix = `${colorCode}[${timestamp}] ${level}:${reset}`;
    
    if (Object.keys(meta).length > 0) {
      console.log(`${prefix} ${message}`, meta);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Generic log method
   */
  log(level, message, meta = {}) {
    const levelValue = LOG_LEVELS[level];
    
    if (levelValue <= this.logLevel) {
      const formattedMessage = this.formatMessage(level, message, meta);
      
      // Always log to console in development
      if (process.env.NODE_ENV === 'development' || levelValue <= LOG_LEVELS.WARN) {
        this.logToConsole(level, message, meta);
      }
      
      // Write to file in production
      if (process.env.NODE_ENV === 'production') {
        this.writeToFile(level, formattedMessage);
      }
    }
  }

  /**
   * Error logging
   */
  error(message, meta = {}) {
    this.log('ERROR', message, meta);
  }

  /**
   * Warning logging
   */
  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }

  /**
   * Info logging
   */
  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }

  /**
   * Debug logging
   */
  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }

  /**
   * Log HTTP requests
   */
  logRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      requestId: req.requestId
    };

    if (res.statusCode >= 400) {
      this.warn(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData);
    } else {
      this.info(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData);
    }
  }

  /**
   * Log database operations
   */
  logDatabase(operation, table, duration, success = true, error = null) {
    const logData = {
      operation,
      table,
      duration: `${duration}ms`,
      success
    };

    if (error) {
      logData.error = error.message;
      this.error(`Database ${operation} failed on ${table}`, logData);
    } else {
      this.debug(`Database ${operation} on ${table}`, logData);
    }
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;