export function computeOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

export function slicePage<T>(
  items: T[],
  page: number,
  pageSize: number,
): T[] {
  const start = computeOffset(page, pageSize);
  return items.slice(start, start + pageSize);
}