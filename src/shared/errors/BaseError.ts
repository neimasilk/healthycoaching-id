/**
 * Base Error Class
 * Foundation for all application errors with correlation ID support
 * Location: src/shared/errors/BaseError.ts
 */

import { generateCorrelationId } from '../utils/correlationId';

export abstract class BaseError extends Error {
  public readonly correlationId: string;
  public readonly timestamp: Date;
  public readonly errorCode: string;
  public readonly context?: Record<string, any>;
  public readonly cause?: Error;
  public readonly isRetryable: boolean;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';

  constructor(
    message: string,
    errorCode: string,
    correlationId?: string,
    context?: Record<string, any>,
    cause?: Error,
    isRetryable: boolean = false,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    super(message);

    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.correlationId = correlationId || generateCorrelationId();
    this.timestamp = new Date();
    this.context = context;
    this.cause = cause;
    this.isRetryable = isRetryable;
    this.severity = severity;

    // Ensure the stack trace points to where the error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get formatted error message with correlation ID
   */
  getFormattedMessage(): string {
    return `[${this.correlationId}] ${this.message}`;
  }

  /**
   * Get error summary for logging
   */
  getErrorSummary(): {
    name: string;
    message: string;
    correlationId: string;
    errorCode: string;
    timestamp: string;
    severity: string;
    isRetryable: boolean;
    stack?: string;
    context?: Record<string, any>;
  } {
    return {
      name: this.name,
      message: this.message,
      correlationId: this.correlationId,
      errorCode: this.errorCode,
      timestamp: this.timestamp.toISOString(),
      severity: this.severity,
      isRetryable: this.isRetryable,
      stack: this.stack,
      context: this.context
    };
  }

  /**
   * Check if error should be reported to monitoring
   */
  shouldReport(): boolean {
    return this.severity === 'high' || this.severity === 'critical';
  }

  /**
   * Convert to JSON for API responses
   */
  toJSON(): {
    error: string;
    correlationId: string;
    errorCode: string;
    timestamp: string;
    isRetryable: boolean;
    details?: Record<string, any>;
  } {
    return {
      error: this.message,
      correlationId: this.correlationId,
      errorCode: this.errorCode,
      timestamp: this.timestamp.toISOString(),
      isRetryable: this.isRetryable,
      details: this.context
    };
  }

  /**
   * Check if this is same type as another error
   */
  isSameType(other: Error): boolean {
    return other instanceof this.constructor;
  }

  /**
   * Check if error code matches
   */
  hasErrorCode(code: string): boolean {
    return this.errorCode === code;
  }
}

/**
 * Validation Error
 */
export class ValidationError extends BaseError {
  constructor(
    message: string,
    public readonly validationErrors: string[] = [],
    correlationId?: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      'VALIDATION_ERROR',
      correlationId,
      { ...context, validationErrors },
      undefined,
      false,
      'low'
    );
    this.name = 'ValidationError';
  }
}

/**
 * Business Logic Error
 */
export class BusinessLogicError extends BaseError {
  constructor(
    message: string,
    errorCode: string,
    correlationId?: string,
    context?: Record<string, any>,
    isRetryable: boolean = false,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    super(
      message,
      errorCode,
      correlationId,
      context,
      undefined,
      isRetryable,
      severity
    );
    this.name = 'BusinessLogicError';
  }
}

/**
 * Network Error
 */
export class NetworkError extends BaseError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly url?: string,
    correlationId?: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      'NETWORK_ERROR',
      correlationId,
      { ...context, statusCode, url },
      undefined,
      true, // Network errors are typically retryable
      'medium'
    );
    this.name = 'NetworkError';
  }
}

/**
 * Timeout Error
 */
export class TimeoutError extends BaseError {
  constructor(
    message: string,
    public readonly timeoutMs: number,
    correlationId?: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      'TIMEOUT_ERROR',
      correlationId,
      { ...context, timeoutMs },
      undefined,
      true, // Timeouts are typically retryable
      'medium'
    );
    this.name = 'TimeoutError';
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends BaseError {
  constructor(
    resource: string,
    resourceId?: string,
    correlationId?: string,
    context?: Record<string, any>
  ) {
    const message = resourceId
      ? `${resource} with ID '${resourceId}' not found`
      : `${resource} not found`;

    super(
      message,
      'NOT_FOUND',
      correlationId,
      { ...context, resource, resourceId },
      undefined,
      false,
      'low'
    );
    this.name = 'NotFoundError';
  }
}

/**
 * Permission Error
 */
export class PermissionError extends BaseError {
  constructor(
    action: string,
    resource?: string,
    correlationId?: string,
    context?: Record<string, any>
  ) {
    const message = resource
      ? `Insufficient permissions to ${action} ${resource}`
      : `Insufficient permissions to ${action}`;

    super(
      message,
      'PERMISSION_DENIED',
      correlationId,
      { ...context, action, resource },
      undefined,
      false,
      'medium'
    );
    this.name = 'PermissionError';
  }
}

/**
 * Configuration Error
 */
export class ConfigurationError extends BaseError {
  constructor(
    message: string,
    public readonly configKey?: string,
    correlationId?: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      'CONFIGURATION_ERROR',
      correlationId,
      { ...context, configKey },
      undefined,
      false,
      'high'
    );
    this.name = 'ConfigurationError';
  }
}