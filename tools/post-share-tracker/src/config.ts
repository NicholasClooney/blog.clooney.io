import fs from "node:fs";
import YAML from "yaml";
import { configPath } from "./config/paths.js";
import type { TrackerConfig } from "./config/types.js";
import { ensureRecencyBands, ensureStringArray } from "./config/validation.js";

let cachedConfig: TrackerConfig | null = null;

const readTrackerConfig = (): TrackerConfig => {
  if (cachedConfig) {
    return cachedConfig;
  }

  const fileContents = fs.readFileSync(configPath, "utf8");
  const parsed = YAML.parse(fileContents) as
    | Partial<Record<string, unknown>>
    | undefined;

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Config error: unable to parse tracker config.");
  }

  const social = parsed.social as { channels?: unknown; states?: unknown } | undefined;
  const channelActivity = parsed.channelActivity as
    | { recencyBands?: unknown }
    | undefined;

  const channels = ensureStringArray(social?.channels, "social.channels");
  const states = ensureStringArray(social?.states, "social.states");
  const recencyBands = ensureRecencyBands(
    channelActivity?.recencyBands,
    "channelActivity.recencyBands"
  );

  cachedConfig = {
    social: {
      channels,
      states,
    },
    channelActivity: {
      recencyBands,
    },
  };

  return cachedConfig;
};

export const getTrackerConfig = (): TrackerConfig => readTrackerConfig();

const trackerConfig = getTrackerConfig();

export const SOCIAL_CHANNELS = trackerConfig.social.channels;
export const SOCIAL_STATES = trackerConfig.social.states;
export const CHANNEL_ACTIVITY_RECENCY_BANDS =
  trackerConfig.channelActivity.recencyBands;

export type SocialChannel = (typeof SOCIAL_CHANNELS)[number];
export type SocialState = (typeof SOCIAL_STATES)[number];

export type {
  ChannelActivityRecencyBand,
  TrackerConfig,
} from "./config/types.js";
