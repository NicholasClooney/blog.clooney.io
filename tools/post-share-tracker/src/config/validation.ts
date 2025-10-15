import type { ChannelActivityRecencyBand } from "./types.js";
import { parseDurationToMs } from "./duration.js";

export const ensureStringArray = (value: unknown, label: string): string[] => {
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

export const ensureRecencyBands = (
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
