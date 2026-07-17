import { toast } from "sonner";

export const API_ERROR_CODES = {
  REQUIRED_RISK_PROFILER: "REQUIRED_RISK_PROFILER",
  INSUFFICIENT_INCOME: "INSUFFICIENT_INCOME",
  DUPLICATE_PRIORITY_GOALS: "DUPLICATE_PRIORITY_GOALS",
  NOT_UNIQUE_EMAIL: "NOT_UNIQUE_EMAIL",
  DELISTED_PRODUCT: "DELISTED_PRODUCT",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  ITEM_NOT_FOUND: "ITEM_NOT_FOUND",
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION: "VALIDATION",
  INVALID_REQUEST_BODY: "INVALID_REQUEST_BODY",
  REQUIRED_REFRESH_TOKEN: "REQUIRED_REFRESH_TOKEN",
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_TOKEN: "INVALID_TOKEN",
  NOT_FOUND: "NOT_FOUND",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
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

    case API_ERROR_CODES.DUPLICATE_PRIORITY_GOALS:
      toast.error("Duplikat Prioritas", {
        description: "Anda hanya dapat memiliki satu goal prioritas.",
      });
      return true;

    case API_ERROR_CODES.INSUFFICIENT_INCOME:
      toast.error("Pendapatan Tidak Cukup", {
        description: "Pendapatan Anda tidak mencukupi untuk goal ini.",
      });
      return true;

    case API_ERROR_CODES.NOT_UNIQUE_EMAIL:
      toast.error("Email Sudah Terdaftar", {
        description: "Email ini sudah digunakan akun lain.",
      });
      return true;

    case API_ERROR_CODES.USER_NOT_FOUND:
    case API_ERROR_CODES.ITEM_NOT_FOUND:
      toast.error("Tidak Ditemukan", {
        description: "Data yang diminta tidak ditemukan.",
      });
      return true;

    default:
      return false;
  }
}
