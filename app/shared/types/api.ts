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

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}
