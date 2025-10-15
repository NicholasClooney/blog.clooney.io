import { describe, expect, it } from "vitest";

import {
  findSequentialTokenRanges,
  matchesTokens,
  toFilterTokens,
} from "../src/filtering.js";

describe("toFilterTokens", () => {
  it("splits on whitespace and lowercases tokens", () => {
    expect(toFilterTokens(" Foo  Bar\tBaz ")).toEqual(["foo", "bar", "baz"]);
  });

  it("filters out empty tokens", () => {
    expect(toFilterTokens("   ")).toEqual([]);
    expect(toFilterTokens("one   ")).toEqual(["one"]);
  });
});

describe("findSequentialTokenRanges", () => {
  it("returns empty ranges when no tokens provided", () => {
    expect(findSequentialTokenRanges("anything", [])).toEqual([]);
  });

  it("matches tokens sequentially regardless of case", () => {
    const value = "Share to Twitter right now";
    const ranges = findSequentialTokenRanges(value, ["share", "TWITTER"]);
    expect(ranges).toEqual([
      { start: 0, end: 5 },
      { start: 9, end: 16 },
    ]);
  });

  it("returns null when tokens are missing or out of order", () => {
    expect(findSequentialTokenRanges("alpha beta gamma", ["gamma", "alpha"])).toBeNull();
    expect(findSequentialTokenRanges("alpha beta gamma", ["alpha", "delta"])).toBeNull();
  });
});

describe("matchesTokens", () => {
  it("returns true when all tokens match in sequence", () => {
    expect(matchesTokens("Queue the LinkedIn post", ["queue", "post"])).toBe(true);
  });

  it("returns false when tokens do not match sequentially", () => {
    expect(matchesTokens("Schedule the newsletter send", ["send", "schedule"])).toBe(false);
  });
});
