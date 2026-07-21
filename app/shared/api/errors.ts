import { toast } from "sonner";

export interface ValidationFieldError {
  field: string;
  reason: string;
  type: string;
}

/**
 * Backend error detail structure.
 * - detail: Optional error code identifier (e.g., "NOT_UNIQUE_EMAIL")
 * - fields: Validation field errors (present when code=400 and message="INVALID FIELD VALUES")
 * - errorId: UUID for 500 Internal Server Error tracking
 * - path: Request path (for 404 errors)
 * - method: HTTP method (for 404 errors)
 */
export interface BackendErrorDetail {
  detail?: string;
  errorId?: string;
  fields?: ValidationFieldError[];
  path?: string;
  method?: string;
}

/**
 * Backend API error response structure (matches ApiResponse<T> when error occurs).
 * The `message` field contains the human-readable English error message from backend.
 */
export interface BackendErrorResponse {
  code: number;
  result: null;
  message: string | null;
  error: BackendErrorDetail | null;
}

/**
 * Checks if an error object represents a structured backend API error response
 */
export function isBackendError(error: any): error is BackendErrorResponse {
  return (
    error &&
    typeof error === "object" &&
    "code" in error &&
    "error" in error &&
    error.error !== null
  );
}

/**
 * Processes backend error responses and shows toast notifications.
 * Uses backend English messages directly - no frontend mapping.
 * Returns true if the error was handled globally (toast shown), false if it should bubble up.
 */
export function handleGlobalApiError(error: any): boolean {
  if (!isBackendError(error)) return false;

  const errorCode = error.error?.detail;
  const backendMessage = error.message; // Backend's English error message

  // Skip validation errors - these should be handled by forms
  if (errorCode === "VALIDATION" && error.error?.fields) {
    return false;
  }

  // Skip auth errors - handled by interceptor
  if (
    errorCode === "UNAUTHORIZED" ||
    errorCode === "INVALID_TOKEN" ||
    errorCode === "REQUIRED_REFRESH_TOKEN"
  ) {
    return false;
  }

  // Show toast with backend message
  const title = backendMessage || "Error";
  const description = errorCode ? `Error code: ${errorCode}` : undefined;

  // Use warning toast for 403 Forbidden, error for others
  if (error.code === 403) {
    toast.warning(title, { description });
  } else {
    toast.error(title, { description });
  }

  return true;
}

/**
 * Extracts validation field errors from backend response.
 * Returns a map of field names to error messages (English from backend).
 */
export function extractValidationErrors(
  error: any
): Record<string, string> | null {
  if (!isBackendError(error)) return null;
  if (!error.error?.fields || error.error.fields.length === 0) return null;

  const fieldErrors: Record<string, string> = {};

  for (const fieldError of error.error.fields) {
    // If multiple errors for same field, concatenate them
    if (fieldErrors[fieldError.field]) {
      fieldErrors[fieldError.field] += `, ${fieldError.reason}`;
    } else {
      fieldErrors[fieldError.field] = fieldError.reason;
    }
  }

  return fieldErrors;
}

/**
 * Gets error message for a specific field from validation errors.
 */
export function getFieldError(error: any, fieldName: string): string | null {
  const validationErrors = extractValidationErrors(error);
  return validationErrors?.[fieldName] || null;
}

/**
 * Extracts the human-readable error message from backend response.
 * 
 * Priority:
 * 1. Backend's `message` field (always in English)
 * 2. Generic fallback for unstructured errors
 * 
 * @param error - The error object from catch block
 * @param fallback - Default message if backend message unavailable
 * @returns English error message to display to user
 */
export function getBackendErrorMessage(
  error: any,
  fallback: string = "An error occurred. Please try again."
): string {
  // Structured backend error with message field
  if (isBackendError(error) && error.message) {
    return error.message;
  }

  // Axios error with response data
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Network error or other
  if (error?.message && typeof error.message === "string") {
    return error.message;
  }

  return fallback;
}
