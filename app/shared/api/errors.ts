import { toast } from "sonner";

export interface ValidationFieldError {
  field: string;
  reason: string;
  type: string;
}

export interface BackendErrorDetail {
  detail?: string;
  errorId?: string;
  fields?: ValidationFieldError[];
  path?: string;
  method?: string;
}

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
  const backendMessage = error.message;

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
