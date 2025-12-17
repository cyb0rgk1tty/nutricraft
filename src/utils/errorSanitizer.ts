/**
 * Error Sanitization Utility
 *
 * Provides functions to sanitize error messages before returning them to clients.
 * Prevents leaking sensitive information like API keys, database details, or file paths.
 */

// Patterns that might indicate sensitive information
const SENSITIVE_PATTERNS = [
  // API keys and tokens
  /api[_-]?key[=:]\s*['"]?[\w-]+['"]?/gi,
  /bearer\s+[\w.-]+/gi,
  /token[=:]\s*['"]?[\w.-]+['"]?/gi,
  /password[=:]\s*['"]?[^'"]+['"]?/gi,
  /secret[=:]\s*['"]?[\w.-]+['"]?/gi,

  // Database connection strings
  /postgres(ql)?:\/\/[^\s]+/gi,
  /mysql:\/\/[^\s]+/gi,
  /mongodb(\+srv)?:\/\/[^\s]+/gi,

  // File paths (absolute paths)
  /\/var\/www\/[^\s]+/g,
  /\/home\/[^\s]+/g,
  /\/Users\/[^\s]+/g,
  /C:\\[^\s]+/gi,

  // Environment variables with values
  /process\.env\.\w+\s*=\s*['"][^'"]+['"]/g,

  // Supabase/database specific
  /supabase[_-]?url[=:]\s*['"]?https?:\/\/[^\s'"]+['"]?/gi,
  /supabase[_-]?(anon|service)[_-]?key[=:]\s*['"]?[\w.-]+['"]?/gi,

  // Email addresses in errors (could be service accounts)
  /[\w.-]+@[\w.-]+\.iam\.gserviceaccount\.com/gi,
];

// Safe generic messages for common error types
const ERROR_TYPE_MESSAGES: Record<string, string> = {
  PGRST: 'Database query error',
  ECONNREFUSED: 'Service connection error',
  ETIMEDOUT: 'Request timeout',
  ENOTFOUND: 'Service not available',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  'rate limit': 'Rate limit exceeded',
  'not found': 'Resource not found',
  'validation': 'Validation error',
};

/**
 * Sanitize an error message to remove sensitive information
 *
 * @param error - The error object or message
 * @param includeType - Whether to include a generic error type hint
 * @returns A safe error message string
 */
export function sanitizeErrorMessage(
  error: unknown,
  includeType: boolean = true
): string {
  // Get the error message
  let message: string;
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    return 'An unexpected error occurred';
  }

  // Check for sensitive patterns and redact
  let sanitized = message;
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }

  // If we redacted something, use a generic message instead
  if (sanitized.includes('[REDACTED]')) {
    // Try to determine error type for a helpful but safe message
    if (includeType) {
      for (const [pattern, safeMessage] of Object.entries(ERROR_TYPE_MESSAGES)) {
        if (message.toLowerCase().includes(pattern.toLowerCase())) {
          return safeMessage;
        }
      }
    }
    return 'An error occurred while processing your request';
  }

  // Truncate very long messages
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200) + '...';
  }

  return sanitized;
}

/**
 * Create a safe error response for API endpoints
 *
 * @param error - The error that occurred
 * @param defaultMessage - Default message if error can't be safely displayed
 * @returns Object with safe error message
 */
export function createSafeErrorResponse(
  error: unknown,
  defaultMessage: string = 'Internal server error'
): { error: string } {
  const safeMessage = sanitizeErrorMessage(error);

  // If sanitization resulted in a generic message, use the default
  if (
    safeMessage === 'An unexpected error occurred' ||
    safeMessage === 'An error occurred while processing your request'
  ) {
    return { error: defaultMessage };
  }

  return { error: safeMessage };
}

/**
 * Log the full error details server-side while returning a safe message
 *
 * @param context - Where the error occurred (for logging)
 * @param error - The error that occurred
 * @param defaultMessage - Default message for clients
 * @returns Safe error message for clients
 */
export function logAndSanitize(
  context: string,
  error: unknown,
  defaultMessage: string = 'Internal server error'
): string {
  // Log the full error server-side
  console.error(`[${context}]`, error);

  // Return sanitized message for clients
  return createSafeErrorResponse(error, defaultMessage).error;
}
