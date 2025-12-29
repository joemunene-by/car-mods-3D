export const numericTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | null): number | null => {
    if (value === null) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  },
};
