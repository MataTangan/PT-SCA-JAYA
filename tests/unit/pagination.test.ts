import { describe, expect, it } from "vitest";
import { normalizePagination, totalPages } from "../../src/backend/shared/utils/pagination";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../../src/shared/constants";

describe("normalizePagination", () => {
  it("applies defaults for missing values", () => {
    expect(normalizePagination()).toEqual({
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
      from: 0,
      to: DEFAULT_PAGE_SIZE - 1,
    });
  });

  it("clamps the page size to the maximum", () => {
    const result = normalizePagination(2, 1000);
    expect(result.pageSize).toBe(MAX_PAGE_SIZE);
    expect(result.from).toBe(MAX_PAGE_SIZE);
    expect(result.to).toBe(MAX_PAGE_SIZE * 2 - 1);
  });

  it("falls back for invalid values", () => {
    expect(normalizePagination(-1, 0)).toEqual({
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
      from: 0,
      to: DEFAULT_PAGE_SIZE - 1,
    });
    expect(normalizePagination(Number.NaN, Number.POSITIVE_INFINITY).page).toBe(DEFAULT_PAGE);
  });

  it("floors fractional page numbers", () => {
    expect(normalizePagination(3.9, 10.8)).toMatchObject({ page: 3, pageSize: 10 });
  });
});

describe("totalPages", () => {
  it.each([
    [0, 20, 0],
    [1, 20, 1],
    [20, 20, 1],
    [21, 20, 2],
    [100, 30, 4],
  ])("returns %s items / %s per page -> %s pages", (total, pageSize, expected) => {
    expect(totalPages(total, pageSize)).toBe(expected);
  });

  it("guards against non-positive page sizes", () => {
    expect(totalPages(10, 0)).toBe(0);
  });
});
