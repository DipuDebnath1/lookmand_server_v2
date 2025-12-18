import { FilterQuery, PopulateOptions, SortOrder } from 'mongoose';

/**
 * 🔹 Pagination Result Interface
 */
export interface TPaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TPopulateAndSelect {
  select?: string | string[] | Record<string, 0 | 1 | boolean | object>;
  populate?: PopulateOptions | PopulateOptions[];
}

export interface TQueryFields<T> extends TPopulateAndSelect {
  filters?: FilterQuery<T>;
  sort?: Record<string, SortOrder>;
}

export interface TQueryFieldsWithPagination<T> extends TQueryFields<T> {
  page?: number;
  limit?: number;
}
