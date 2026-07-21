import { useCallback } from "react";
import { toast } from "sonner";
import {
  isBackendError,
  extractValidationErrors,
  type BackendErrorResponse,
} from "~/shared/api/errors";

export interface ErrorHandlerOptions {
  /** Show toast notification for the error */
  showToast?: boolean;
  /** Custom fallback message if error is not a backend error */
  fallbackMessage?: string;
  /** Callback to execute after handling the error */
  onError?: (error: any) => void;
}

/**
 * Hook for handling backend errors in components.
 * Uses backend English messages directly - no frontend mapping.
 */
export function useErrorHandler() {
  const handleError = useCallback(
    (error: any, options: ErrorHandlerOptions = {}) => {
      const {
        showToast = true,
        fallbackMessage = "An unexpected error occurred.",
        onError,
      } = options;

      let title: string;
      let description: string | undefined;

      if (isBackendError(error)) {
        // Use backend message directly
        title = error.message || "Error";
        description = error.error?.detail
          ? `Error code: ${error.error.detail}`
          : undefined;
      } else {
        title = "Error";
        description = fallbackMessage;
      }

      if (showToast) {
        toast.error(title, { description });
      }

      if (onError) {
        onError(error);
      }

      return { title, description };
    },
    []
  );

  const getValidationErrors = useCallback((error: any) => {
    return extractValidationErrors(error);
  }, []);

  return {
    handleError,
    getValidationErrors,
  };
}
