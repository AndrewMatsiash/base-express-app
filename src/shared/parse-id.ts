export const parseId = (rawId: string): number | null =>
  /^\d+$/.test(rawId) ? Number(rawId) : null;
