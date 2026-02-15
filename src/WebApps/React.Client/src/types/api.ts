export interface ApiResult<T> {
  isSucceeded: boolean;
  message?: string;
  result?: T;
}

export interface PagingParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  orderBy?: string;
}
