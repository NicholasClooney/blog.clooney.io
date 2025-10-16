const DEFAULT_WIDTH = 80;

const ensurePositive = (value: number): number => {
  if (Number.isNaN(value) || !Number.isFinite(value) || value <= 0) {
    return DEFAULT_WIDTH;
  }
  return value;
};

export const estimateWrappedLines = (
  text: string | null | undefined,
  width: number
): number => {
  if (!text) {
    return 0;
  }

  const effectiveWidth = Math.max(1, ensurePositive(width));

  return text
    .split("\n")
    .reduce((total, line) => {
      if (line.length === 0) {
        return total + 1;
      }
      return total + Math.max(1, Math.ceil(line.length / effectiveWidth));
    }, 0);
};

export const estimateWidthRows = (contentWidth: number, columns: number): number => {
  if (contentWidth <= 0) {
    return 0;
  }

  const effectiveColumns = Math.max(1, ensurePositive(columns));
  return Math.max(1, Math.ceil(contentWidth / effectiveColumns));
};
