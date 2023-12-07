export interface PaginatorInputProps<T> {
  model: any;
  page?: number;
  items_per_page?: number;
  search?: string;
  relations?: T;
}
export interface QueryParamsInterface {
  page: number;
  items_per_page: number;
  search: string;
}

export interface PaginationMetaData {
  totalPages: number;
  page: number;
  items_per_page: number;
}
export interface PaginatorOutputProps {
  data: any;
  pagination: PaginationMetaData;
}
