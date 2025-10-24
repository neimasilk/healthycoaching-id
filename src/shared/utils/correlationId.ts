/**
 * Correlation ID Utilities
 * Generates and manages correlation IDs for error tracking
 * Location: src/shared/utils/correlationId.ts
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate unique correlation ID for tracking
 */
export function generateCorrelationId(): string {
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
  const uuid = uuidv4().substring(0, 8);
  return `HC-${timestamp}-${uuid}`;
}

/**
 * Extract correlation ID from error or string
 */
export function extractCorrelationId(error: Error | string): string | null {
  const errorString = error instanceof Error ? error.message : error;

  // Look for correlation ID pattern: HC-YYYYMMDDHHMMSS-XXXXXXXX
  const match = errorString.match(/HC-(\d{14}-[a-f0-9]{8})/);
  return match ? match[1] : null;
}

/**
 * Add correlation ID to error message
 */
export function addCorrelationToError(error: Error, correlationId?: string): Error {
  const id = correlationId || generateCorrelationId();
  const message = `${id}: ${error.message}`;

  if (error instanceof Error) {
    const newError = new Error(message);
    newError.name = error.name;
    newError.stack = error.stack;
    return newError;
  }

  return new Error(message);
}

/**
 * Create error context object for logging
 */
export function createErrorContext(
  correlationId: string,
  context: Record<string, unknown>
): Record<string, unknown> {
  return {
    correlationId,
    timestamp: new Date().toISOString(),
    platform: 'healthycoaching-id',
    version: process.env.REACT_APP_VERSION || '1.0.0',
    ...context
  };
}

/**
 * Generate user session ID
 */
export function generateSessionId(): string {
  return `SESSION-${generateCorrelationId()}`;
}

/**
 * Generate request ID for API calls
 */
export function generateRequestId(): string {
  return `REQ-${generateCorrelationId()}`;
}

/**
 * Generate log entry ID
 */
export function generateLogId(): string {
  return `LOG-${generateCorrelationId()}`;
}