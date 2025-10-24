/**
 * Unit Tests: BaseError
 * Location: src/shared/errors/__tests__/BaseError.test.ts
 */

import {
  BaseError,
  ValidationError,
  BusinessLogicError,
  NetworkError,
  TimeoutError,
  NotFoundError,
  PermissionError,
  ConfigurationError
} from '../BaseError';
import { generateCorrelationId } from '../../utils/correlationId';

describe('BaseError', () => {
  describe('Constructor', () => {
    it('should create error with required fields', () => {
      const error = new TestBaseError('Test message', 'TEST_ERROR');

      expect(error.message).toBe('Test message');
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.correlationId).toMatch(/^HC-\d{14}-[a-f0-9]{8}$/);
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.name).toBe('TestBaseError');
      expect(error.isRetryable).toBe(false);
      expect(error.severity).toBe('medium');
    });

    it('should use provided correlation ID', () => {
      const customId = 'CUSTOM-12345';
      const error = new TestBaseError('Test message', 'TEST_ERROR', customId);

      expect(error.correlationId).toBe(customId);
    });

    it('should include all optional fields', () => {
      const context = { userId: '123', action: 'test' };
      const cause = new Error('Cause error');
      const error = new TestBaseError(
        'Test message',
        'TEST_ERROR',
        undefined,
        context,
        cause,
        true,
        'high'
      );

      expect(error.context).toEqual(context);
      expect(error.cause).toBe(cause);
      expect(error.isRetryable).toBe(true);
      expect(error.severity).toBe('high');
    });
  });

  describe('getFormattedMessage', () => {
    it('should return formatted message with correlation ID', () => {
      const correlationId = 'HC-20231024123456-abcdef12';
      const error = new TestBaseError('Test message', 'TEST_ERROR', correlationId);

      expect(error.getFormattedMessage()).toBe(`[${correlationId}] Test message`);
    });
  });

  describe('getErrorSummary', () => {
    it('should return complete error summary', () => {
      const correlationId = 'HC-20231024123456-abcdef12';
      const context = { userId: '123' };
      const error = new TestBaseError('Test message', 'TEST_ERROR', correlationId, context);

      const summary = error.getErrorSummary();

      expect(summary).toEqual({
        name: 'TestBaseError',
        message: 'Test message',
        correlationId,
        errorCode: 'TEST_ERROR',
        timestamp: error.timestamp.toISOString(),
        severity: 'medium',
        isRetryable: false,
        stack: expect.any(String),
        context
      });
    });
  });

  describe('shouldReport', () => {
    it('should report high severity errors', () => {
      const error = new TestBaseError('Test', 'TEST_ERROR', undefined, undefined, undefined, false, 'high');
      expect(error.shouldReport()).toBe(true);
    });

    it('should report critical severity errors', () => {
      const error = new TestBaseError('Test', 'TEST_ERROR', undefined, undefined, undefined, false, 'critical');
      expect(error.shouldReport()).toBe(true);
    });

    it('should not report low severity errors', () => {
      const error = new TestBaseError('Test', 'TEST_ERROR', undefined, undefined, undefined, false, 'low');
      expect(error.shouldReport()).toBe(false);
    });

    it('should not report medium severity errors', () => {
      const error = new TestBaseError('Test', 'TEST_ERROR', undefined, undefined, undefined, false, 'medium');
      expect(error.shouldReport()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation', () => {
      const correlationId = 'HC-20231024123456-abcdef12';
      const context = { userId: '123' };
      const error = new TestBaseError('Test message', 'TEST_ERROR', correlationId, context);

      const json = error.toJSON();

      expect(json).toEqual({
        error: 'Test message',
        correlationId,
        errorCode: 'TEST_ERROR',
        timestamp: error.timestamp.toISOString(),
        isRetryable: false,
        details: context
      });
    });
  });

  describe('isSameType', () => {
    it('should return true for same error type', () => {
      const error1 = new TestBaseError('Message 1', 'ERROR_1');
      const error2 = new TestBaseError('Message 2', 'ERROR_2');

      expect(error1.isSameType(error2)).toBe(true);
    });

    it('should return false for different error types', () => {
      const baseError = new TestBaseError('Message', 'ERROR');
      const validationError = new ValidationError('Validation failed');

      expect(baseError.isSameType(validationError)).toBe(false);
    });
  });

  describe('hasErrorCode', () => {
    it('should return true for matching error code', () => {
      const error = new TestBaseError('Message', 'TEST_ERROR');

      expect(error.hasErrorCode('TEST_ERROR')).toBe(true);
      expect(error.hasErrorCode('OTHER_ERROR')).toBe(false);
    });
  });
});

describe('ValidationError', () => {
  it('should create validation error with default severity', () => {
    const validationErrors = ['Field is required', 'Invalid format'];
    const error = new ValidationError('Validation failed', validationErrors);

    expect(error.name).toBe('ValidationError');
    expect(error.errorCode).toBe('VALIDATION_ERROR');
    expect(error.validationErrors).toEqual(validationErrors);
    expect(error.severity).toBe('low');
    expect(error.isRetryable).toBe(false);
  });

  it('should include validation errors in context', () => {
    const validationErrors = ['Error 1', 'Error 2'];
    const error = new ValidationError('Validation failed', validationErrors);

    expect(error.context?.validationErrors).toEqual(validationErrors);
  });
});

describe('BusinessLogicError', () => {
  it('should create business logic error', () => {
    const error = new BusinessLogicError('Business rule violated', 'BUSINESS_RULE_ERROR');

    expect(error.name).toBe('BusinessLogicError');
    expect(error.errorCode).toBe('BUSINESS_RULE_ERROR');
    expect(error.severity).toBe('medium');
    expect(error.isRetryable).toBe(false);
  });

  it('should accept custom severity', () => {
    const error = new BusinessLogicError('Critical business error', 'CRITICAL_ERROR', undefined, undefined, false, 'critical');

    expect(error.severity).toBe('critical');
  });
});

describe('NetworkError', () => {
  it('should create network error', () => {
    const error = new NetworkError('Connection failed', 500, 'https://api.example.com');

    expect(error.name).toBe('NetworkError');
    expect(error.errorCode).toBe('NETWORK_ERROR');
    expect(error.statusCode).toBe(500);
    expect(error.url).toBe('https://api.example.com');
    expect(error.isRetryable).toBe(true);
  });

  it('should include network info in context', () => {
    const error = new NetworkError('Failed', 404, 'https://api.example.com');

    expect(error.context?.statusCode).toBe(404);
    expect(error.context?.url).toBe('https://api.example.com');
  });
});

describe('TimeoutError', () => {
  it('should create timeout error', () => {
    const error = new TimeoutError('Operation timed out', 5000);

    expect(error.name).toBe('TimeoutError');
    expect(error.errorCode).toBe('TIMEOUT_ERROR');
    expect(error.timeoutMs).toBe(5000);
    expect(error.isRetryable).toBe(true);
  });

  it('should include timeout in context', () => {
    const error = new TimeoutError('Timeout', 10000);

    expect(error.context?.timeoutMs).toBe(10000);
  });
});

describe('NotFoundError', () => {
  it('should create error with resource name', () => {
    const error = new NotFoundError('User');

    expect(error.name).toBe('NotFoundError');
    expect(error.errorCode).toBe('NOT_FOUND');
    expect(error.message).toBe('User not found');
    expect(error.isRetryable).toBe(false);
    expect(error.severity).toBe('low');
  });

  it('should create error with resource name and ID', () => {
    const error = new NotFoundError('User', '123');

    expect(error.message).toBe('User with ID \'123\' not found');
  });

  it('should include resource info in context', () => {
    const error = new NotFoundError('Product', '456');

    expect(error.context?.resource).toBe('Product');
    expect(error.context?.resourceId).toBe('456');
  });
});

describe('PermissionError', () => {
  it('should create error with action and resource', () => {
    const error = new PermissionError('delete', 'user account');

    expect(error.name).toBe('PermissionError');
    expect(error.errorCode).toBe('PERMISSION_DENIED');
    expect(error.message).toBe('Insufficient permissions to delete user account');
    expect(error.severity).toBe('medium');
  });

  it('should create error with action only', () => {
    const error = new PermissionError('admin');

    expect(error.message).toBe('Insufficient permissions to admin');
  });

  it('should include permission info in context', () => {
    const error = new PermissionError('edit', 'profile');

    expect(error.context?.action).toBe('edit');
    expect(error.context?.resource).toBe('profile');
  });
});

describe('ConfigurationError', () => {
  it('should create configuration error', () => {
    const error = new ConfigurationError('Missing API key', 'API_KEY');

    expect(error.name).toBe('ConfigurationError');
    expect(error.errorCode).toBe('CONFIGURATION_ERROR');
    expect(error.configKey).toBe('API_KEY');
    expect(error.severity).toBe('high');
  });

  it('should include config info in context', () => {
    const error = new ConfigurationError('Invalid config', 'DATABASE_URL');

    expect(error.context?.configKey).toBe('DATABASE_URL');
  });
});

// Test helper class
class TestBaseError extends BaseError {
  constructor(
    message: string,
    errorCode: string,
    correlationId?: string,
    context?: Record<string, any>,
    cause?: Error,
    isRetryable?: boolean,
    severity?: 'low' | 'medium' | 'high' | 'critical'
  ) {
    super(message, errorCode, correlationId, context, cause, isRetryable, severity);
  }
}