import { toast } from "sonner";

export const API_ERROR_CODES = {
  REQUIRED_RISK_PROFILER: "REQUIRED_RISK_PROFILER",
  INSUFFICIENT_INCOME: "INSUFFICIENT_INCOME",
  DUPLICATE_PRIORITY_GOALS: "DUPLICATE_PRIORITY_GOALS",
  NOT_UNIQUE_EMAIL: "NOT_UNIQUE_EMAIL",
  DELISTED_PRODUCT: "DELISTED_PRODUCT",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  ITEM_NOT_FOUND: "ITEM_NOT_FOUND",
} as const;

export type ApiErrorCode = keyof typeof API_ERROR_CODES;

export interface BackendErrorResponse {
  code: number;
  result: null;
  message: string | null;
  error: {
    errorId?: string;
    fields?: Array<{
      field: string;
      reason: string;
      type: string;
    }>;
    detail?: string;
    path?: string;
    method?: string;
  } | null;
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
 * Processes custom backend error responses and shows corresponding global alerts
 * returns true if the error was handled globally (e.g. toast), false if it should bubble up.
 */
export function handleGlobalApiError(error: any): boolean {
  if (!isBackendError(error)) return false;

  const detail = error.error?.detail;
  if (!detail) return false;

  switch (detail) {
    case API_ERROR_CODES.DELISTED_PRODUCT:
      toast.error("Produk Delisted", {
        description: "This product is delisted and cannot be added to portfolio.",
      });
      return true;

    case API_ERROR_CODES.REQUIRED_RISK_PROFILER:
      toast.warning("Profil Risiko Dibutuhkan", {
        description: "Anda harus menyelesaikan kuesioner profil risiko terlebih dahulu.",
      });
      return true;

    default:
      return false;
  }
}
