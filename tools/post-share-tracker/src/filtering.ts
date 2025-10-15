export type TokenMatchRange = {
  start: number;
  end: number;
};

const normalizeTokens = (tokens: string[]): string[] => {
  return tokens
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
};

export const toFilterTokens = (filter: string): string[] => {
  return normalizeTokens(filter.toLowerCase().split(/\s+/));
};

export const findSequentialTokenRanges = (
  value: string,
  tokens: string[]
): TokenMatchRange[] | null => {
  const normalizedTokens = normalizeTokens(tokens);

  if (normalizedTokens.length === 0) {
    return [];
  }

  const haystack = value.toLowerCase();
  let searchIndex = 0;
  const ranges: TokenMatchRange[] = [];

  for (const token of normalizedTokens) {
    const lowerToken = token.toLowerCase();
    const foundIndex = haystack.indexOf(lowerToken, searchIndex);
    if (foundIndex === -1) {
      return null;
    }

    ranges.push({
      start: foundIndex,
      end: foundIndex + lowerToken.length,
    });

    searchIndex = foundIndex + lowerToken.length;
  }

  return ranges;
};

export const matchesTokens = (value: string, tokens: string[]): boolean => {
  return findSequentialTokenRanges(value, tokens) !== null;
};
