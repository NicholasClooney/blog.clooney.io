import { afterEach, describe, expect, it, vi } from "vitest";

const loadConfigModule = async (yaml: string) => {
  vi.resetModules();

  const readFileSync = vi.fn(() => yaml);

  vi.doMock("node:fs", () => ({
    default: { readFileSync },
    readFileSync,
  }));

  const module = await import("../src/config.js");

  return {
    ...module,
    readFileSync,
  };
};

describe("config", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  it("parses and normalizes tracker configuration from YAML", async () => {
    const yaml = [
      "social:",
      "  channels:",
      '    - " twitter "',
      "    - mastodon",
      "    - mastodon",
      "  states:",
      "    - planned",
      "    - shared",
      "channelActivity:",
      "  recencyBands:",
      "    - color: green",
      "      maxAge: 12 hours",
      "    - color: blue",
      "      maxAge: 30 days",
      "    - color: gray",
      "",
    ].join("\n");

    const {
      getTrackerConfig,
      SOCIAL_CHANNELS,
      SOCIAL_STATES,
      CHANNEL_ACTIVITY_RECENCY_BANDS,
      readFileSync,
    } = await loadConfigModule(yaml);

    const config = getTrackerConfig();

    expect(config).toEqual({
      social: {
        channels: ["twitter", "mastodon"],
        states: ["planned", "shared"],
      },
      channelActivity: {
        recencyBands: [
          { color: "green", maxAgeMs: 12 * 60 * 60 * 1000 },
          { color: "blue", maxAgeMs: 30 * 24 * 60 * 60 * 1000 },
          { color: "gray" },
        ],
      },
    });

    expect(SOCIAL_CHANNELS).toEqual(["twitter", "mastodon"]);
    expect(SOCIAL_STATES).toEqual(["planned", "shared"]);
    expect(CHANNEL_ACTIVITY_RECENCY_BANDS).toEqual(config.channelActivity.recencyBands);
    expect(readFileSync).toHaveBeenCalledTimes(1);
    expect(getTrackerConfig()).toBe(config);
  });

  it("caches the parsed configuration between calls", async () => {
    const yaml = [
      "social:",
      "  channels:",
      "    - twitter",
      "  states:",
      "    - shared",
      "channelActivity:",
      "  recencyBands:",
      "    - color: green",
      "      maxAge: 1 day",
      "",
    ].join("\n");

    const { getTrackerConfig, readFileSync } = await loadConfigModule(yaml);

    getTrackerConfig();
    getTrackerConfig();

    expect(readFileSync).toHaveBeenCalledTimes(1);
  });

  it("throws a helpful error when recency bands are not strictly increasing", async () => {
    vi.resetModules();

    const yaml = [
      "social:",
      "  channels:",
      "    - twitter",
      "  states:",
      "    - shared",
      "channelActivity:",
      "  recencyBands:",
      "    - color: green",
      "      maxAge: 2 days",
      "    - color: red",
      "      maxAge: 12 hours",
      "",
    ].join("\n");

    const readFileSync = vi.fn(() => yaml);

    vi.doMock("node:fs", () => ({
      default: { readFileSync },
      readFileSync,
    }));

    await expect(import("../src/config.js")).rejects.toThrow(
      "Config error: channelActivity.recencyBands[1].maxAge must be greater than the previous band."
    );
  });
});
