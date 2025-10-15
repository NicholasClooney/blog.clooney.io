import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const MINUTE_IN_MS = 60 * 1000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const WEEK_IN_MS = 7 * DAY_IN_MS;
const MONTH_IN_MS = 30 * DAY_IN_MS;
const YEAR_IN_MS = 365 * DAY_IN_MS;

export type ChannelActivityRecencyBand = {
  color: string;
  maxAgeMs?: number;
};

export interface TrackerConfig {
  social: {
    channels: string[];
    states: string[];
  };
  channelActivity: {
    recencyBands: ChannelActivityRecencyBand[];
  };
}

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
const configPath = path.join(repoRoot, "tools", "post-share-tracker", "config.yaml");

let cachedConfig: TrackerConfig | null = null;

const ensureStringArray = (value: unknown, label: string): string[] => {
  if (!Array.isArray(value)) {
    throw new Error(`Config error: ${label} must be an array.`);
  }

  const entries = value.map((entry) => {
    if (typeof entry !== "string" || entry.trim() === "") {
      throw new Error(`Config error: ${label} entries must be non-empty strings.`);
    }

    return entry.trim();
  });

  if (entries.length === 0) {
    throw new Error(`Config error: ${label} must contain at least one entry.`);
  }

  return Array.from(new Set(entries));
};

const UNIT_ALIASES: Record<string, number> = {
  minute: MINUTE_IN_MS,
  minutes: MINUTE_IN_MS,
  min: MINUTE_IN_MS,
  mins: MINUTE_IN_MS,
  m: MINUTE_IN_MS,
  hour: HOUR_IN_MS,
  hours: HOUR_IN_MS,
  hr: HOUR_IN_MS,
  hrs: HOUR_IN_MS,
  h: HOUR_IN_MS,
  day: DAY_IN_MS,
  days: DAY_IN_MS,
  d: DAY_IN_MS,
  week: WEEK_IN_MS,
  weeks: WEEK_IN_MS,
  wk: WEEK_IN_MS,
  wks: WEEK_IN_MS,
  w: WEEK_IN_MS,
  month: MONTH_IN_MS,
  months: MONTH_IN_MS,
  mo: MONTH_IN_MS,
  mos: MONTH_IN_MS,
  year: YEAR_IN_MS,
  years: YEAR_IN_MS,
  yr: YEAR_IN_MS,
  yrs: YEAR_IN_MS,
  y: YEAR_IN_MS,
};

const parseDurationToMs = (value: unknown, label: string): number => {
  if (typeof value !== "string") {
    throw new Error(`Config error: ${label} must be a string duration.`);
  }

  const normalized = value.trim().toLowerCase();
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*([a-z]+)$/);

  if (!match) {
    throw new Error(
      `Config error: ${label} "${value}" must match "<number> <unit>", e.g. "24 hours".`
    );
  }

  const magnitude = Number(match[1]);
  if (!Number.isFinite(magnitude) || magnitude <= 0) {
    throw new Error(`Config error: ${label} must be greater than zero.`);
  }

  const unit = match[2];
  const msPerUnit = UNIT_ALIASES[unit];

  if (!msPerUnit) {
    const allowedUnits = Array.from(new Set(Object.keys(UNIT_ALIASES)))
      .sort()
      .join(", ");
    throw new Error(
      `Config error: ${label} has unknown unit "${unit}". Allowed units: ${allowedUnits}.`
    );
  }

  const result = Math.round(magnitude * msPerUnit);

  if (!Number.isFinite(result) || result <= 0) {
    throw new Error(`Config error: ${label} resolved to an invalid duration.`);
  }

  return result;
};

const ensureRecencyBands = (
  value: unknown,
  label: string
): ChannelActivityRecencyBand[] => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Config error: ${label} must be a non-empty array.`);
  }

  const bands = value.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      throw new Error(
        `Config error: ${label}[${index}] must be an object with "color" and optional "maxAge".`
      );
    }

    const colorRaw = (entry as { color?: unknown }).color;
    if (typeof colorRaw !== "string" || colorRaw.trim() === "") {
      throw new Error(`Config error: ${label}[${index}].color must be a non-empty string.`);
    }

    const maxAgeRaw = (entry as { maxAge?: unknown }).maxAge;
    let maxAgeMs: number | undefined;

    if (typeof maxAgeRaw === "string") {
      maxAgeMs = parseDurationToMs(maxAgeRaw, `${label}[${index}].maxAge`);
    } else if (typeof maxAgeRaw === "number") {
      if (!Number.isFinite(maxAgeRaw) || maxAgeRaw <= 0) {
        throw new Error(`Config error: ${label}[${index}].maxAge must be greater than zero.`);
      }
      maxAgeMs = Math.round(maxAgeRaw);
    } else if (maxAgeRaw !== undefined) {
      throw new Error(
        `Config error: ${label}[${index}].maxAge must be a string duration or number of milliseconds.`
      );
    }

    return {
      color: colorRaw.trim(),
      maxAgeMs,
    };
  });

  let previousMax = 0;
  bands.forEach((band, index) => {
    if (band.maxAgeMs === undefined) {
      if (index !== bands.length - 1) {
        throw new Error(
          `Config error: ${label}[${index}].maxAge is missing. Only the last band may omit maxAge.`
        );
      }
      return;
    }

    if (band.maxAgeMs <= previousMax) {
      throw new Error(
        `Config error: ${label}[${index}].maxAge must be greater than the previous band.`
      );
    }

    previousMax = band.maxAgeMs;
  });

  return bands;
};

const loadConfig = (): TrackerConfig => {
  if (cachedConfig) {
    return cachedConfig;
  }

  const fileContents = fs.readFileSync(configPath, "utf8");
  const parsed = YAML.parse(fileContents) as Partial<Record<string, unknown>> | undefined;

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

export const getTrackerConfig = (): TrackerConfig => loadConfig();

const trackerConfig = getTrackerConfig();

export const SOCIAL_CHANNELS = trackerConfig.social.channels;
export const SOCIAL_STATES = trackerConfig.social.states;
export const CHANNEL_ACTIVITY_RECENCY_BANDS =
  trackerConfig.channelActivity.recencyBands;

export type SocialChannel = (typeof SOCIAL_CHANNELS)[number];
export type SocialState = (typeof SOCIAL_STATES)[number];
