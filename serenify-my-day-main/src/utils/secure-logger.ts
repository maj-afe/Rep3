// Secure logging utility that prevents sensitive data exposure

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

class SecureLogger {
  private isDevelopment = import.meta.env.DEV;

  private sanitizeLogData(data: any): any {
    if (!data) return data;

    const sensitive = [
      'password',
      'token',
      'secret',
      'key',
      'api_key',
      'apiKey',
      'razorpay_key_secret',
      'webhook_secret',
      'card_number',
      'cvv',
      'ssn',
      'credit_card',
    ];

    if (typeof data === 'object') {
      const sanitized: any = Array.isArray(data) ? [] : {};
      
      for (const key in data) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitive.some(term => lowerKey.includes(term));
        
        if (isSensitive) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof data[key] === 'object') {
          sanitized[key] = this.sanitizeLogData(data[key]);
        } else {
          sanitized[key] = data[key];
        }
      }
      
      return sanitized;
    }

    return data;
  }

  private log(level: LogLevel, message: string, context?: any): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: context ? this.sanitizeLogData(context) : undefined,
    };

    if (this.isDevelopment) {
      // In development, log to console
      switch (level) {
        case 'error':
          console.error(message, entry.context);
          break;
        case 'warn':
          console.warn(message, entry.context);
          break;
        case 'info':
          console.info(message, entry.context);
          break;
        case 'debug':
          console.debug(message, entry.context);
          break;
      }
    } else {
      // In production, send to logging service (e.g., Sentry)
      // For now, only log errors silently
      if (level === 'error') {
        // TODO: Send to external logging service
        // Example: Sentry.captureMessage(message, { level, extra: entry.context });
      }
    }
  }

  error(message: string, context?: any): void {
    this.log('error', message, context);
  }

  warn(message: string, context?: any): void {
    this.log('warn', message, context);
  }

  info(message: string, context?: any): void {
    this.log('info', message, context);
  }

  debug(message: string, context?: any): void {
    this.log('debug', message, context);
  }

  // Specific methods for common scenarios
  authError(message: string): void {
    this.error(`[Auth] ${message}`);
  }

  paymentError(message: string): void {
    this.error(`[Payment] ${message}`);
  }

  apiError(message: string, endpoint?: string): void {
    this.error(`[API] ${message}`, { endpoint });
  }

  validationError(message: string, field?: string): void {
    this.warn(`[Validation] ${message}`, { field });
  }
}

// Export singleton instance
export const secureLogger = new SecureLogger();

// Export for testing
export { SecureLogger };
