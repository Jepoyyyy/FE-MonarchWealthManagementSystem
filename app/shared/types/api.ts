export interface ApiResponse<T> {
  code: number;
  result: T | null;
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
