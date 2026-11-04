import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../../../shared/constants/statuses";

export interface NormalizedPagination {
  page: number;
  pageSize: number;
  from: number;
  to: number;
}

export function normalizePagination(
  page = DEFAULT_PAGE,
  pageSize = DEFAULT_PAGE_SIZE,
): NormalizedPagination {
  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : DEFAULT_PAGE;
  const safeSize =
    Number.isFinite(pageSize) && pageSize >= 1
      ? Math.min(Math.floor(pageSize), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;
  return {
    page: safePage,
    pageSize: safeSize,
    from: (safePage - 1) * safeSize,
    to: safePage * safeSize - 1,
  };
}

export function totalPages(total: number, pageSize: number): number {
  if (total <= 0 || pageSize <= 0) {
    return 0;
  }
  return Math.ceil(total / pageSize);
}
