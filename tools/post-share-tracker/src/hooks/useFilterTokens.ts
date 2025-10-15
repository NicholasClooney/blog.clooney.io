import { useMemo } from "react";
import { toFilterTokens } from "../filtering.js";

export const useFilterTokens = (value: string): string[] => {
  return useMemo(() => toFilterTokens(value), [value]);
};
