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
