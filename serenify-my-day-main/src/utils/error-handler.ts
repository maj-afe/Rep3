import { secureLogger } from './secure-logger';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network connection failed') {
    super(message, 'NETWORK_ERROR', 503);
    this.name = 'NetworkError';
  }
}

// Get user-friendly error message
export function getUserFriendlyError(error: unknown): string {
  if (error instanceof ValidationError) {
    return error.message;
  }
  
  if (error instanceof AuthenticationError) {
    return 'Please log in to continue.';
  }
  
  if (error instanceof NetworkError) {
    return 'Connection issue. Please check your internet connection.';
  }
  
  if (error instanceof Error) {
    // Check for specific error messages from Supabase
    if (error.message.includes('email') || error.message.includes('password')) {
      return 'Invalid email or password.';
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Connection issue. Please try again.';
    }
    
    if (error.message.includes('already exists')) {
      return 'An account with this email already exists.';
    }
  }
  
  // Default user-friendly message
  return 'Something went wrong. Please try again or contact support.';
}

// Handle and log error
export function handleError(error: unknown, context?: string): string {
  const message = getUserFriendlyError(error);
  
  // Log error details securely
  if (import.meta.env.PROD) {
    const logMessage = context ? `${context}: ${message}` : message;
    secureLogger.error(logMessage, error);
    return 'An unexpected error occurred. Please try again later.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred.';
}

// Handle authentication errors specifically
export function handleAuthError(error: unknown): string {
  const message = getUserFriendlyError(error);
  secureLogger.authError(message);
  return message;
}

// Handle payment errors specifically
export function handlePaymentError(error: unknown): string {
  const message = 'Payment processing failed. Please try again or contact support.';
  secureLogger.paymentError(getUserFriendlyError(error));
  return message;
}

// Handle validation errors
export function handleValidationError(error: unknown, field?: string): string {
  const message = getUserFriendlyError(error);
  secureLogger.validationError(message, field);
  return message;
}
