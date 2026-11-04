/** Standard request/response envelope for custom endpoints and server actions. */
export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: ApiErrorBody;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface PageParams {
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type SortDirection = "asc" | "desc";

export interface ReservationFilters {
  status?: string;
  guestId?: string;
  roomTypeId?: string;
  code?: string;
  from?: string;
  to?: string;
}

export interface HousekeepingFilters {
  status?: string;
  roomId?: string;
  assignedTo?: string;
}
