const MINUTE_IN_MS = 60 * 1000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const WEEK_IN_MS = 7 * DAY_IN_MS;
const MONTH_IN_MS = 30 * DAY_IN_MS;
const YEAR_IN_MS = 365 * DAY_IN_MS;

export const parseLastSharedDate = (value: string): Date | null => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDuration = (
  diffMs: number,
  nowDirectionPositive: boolean,
  unitMs: number,
  unitLabel: string
): string => {
  const wholeUnits = Math.max(1, Math.floor(diffMs / unitMs));
  const plural = wholeUnits === 1 ? "" : "s";
  if (nowDirectionPositive) {
    return `${wholeUnits} ${unitLabel}${plural} ago`;
  }

  return `in ${wholeUnits} ${unitLabel}${plural}`;
};

export const formatRelativeTimeFromNow = (date: Date, now = new Date()): string => {
  const timestamp = date.getTime();
  if (Number.isNaN(timestamp)) {
    return "invalid date";
  }

  const diffMs = now.getTime() - timestamp;
  const absMs = Math.abs(diffMs);
  const isPast = diffMs >= 0;

  if (absMs < MINUTE_IN_MS) {
    return isPast ? "just now" : "in under a minute";
  }

  if (absMs < HOUR_IN_MS) {
    return formatDuration(absMs, isPast, MINUTE_IN_MS, "minute");
  }

  if (absMs < DAY_IN_MS) {
    return formatDuration(absMs, isPast, HOUR_IN_MS, "hour");
  }

  if (absMs < WEEK_IN_MS) {
    return formatDuration(absMs, isPast, DAY_IN_MS, "day");
  }

  if (absMs < MONTH_IN_MS) {
    return formatDuration(absMs, isPast, WEEK_IN_MS, "week");
  }

  if (absMs < YEAR_IN_MS) {
    return formatDuration(absMs, isPast, MONTH_IN_MS, "month");
  }

  return formatDuration(absMs, isPast, YEAR_IN_MS, "year");
};

const formatDurationShort = (
  diffMs: number,
  isPast: boolean,
  unitMs: number,
  suffix: string
): string => {
  const wholeUnits = Math.max(1, Math.floor(diffMs / unitMs));
  const value = `${wholeUnits}${suffix}`;
  return isPast ? value : `in ${value}`;
};

export const formatRelativeTimeFromNowShort = (
  date: Date,
  now = new Date()
): string => {
  const timestamp = date.getTime();
  if (Number.isNaN(timestamp)) {
    return "invalid";
  }

  const diffMs = now.getTime() - timestamp;
  const absMs = Math.abs(diffMs);
  const isPast = diffMs >= 0;

  if (absMs < MINUTE_IN_MS) {
    return isPast ? "now" : "in <1m";
  }

  if (absMs < HOUR_IN_MS) {
    return formatDurationShort(absMs, isPast, MINUTE_IN_MS, "m");
  }

  if (absMs < DAY_IN_MS) {
    return formatDurationShort(absMs, isPast, HOUR_IN_MS, "h");
  }

  if (absMs < WEEK_IN_MS) {
    return formatDurationShort(absMs, isPast, DAY_IN_MS, "d");
  }

  if (absMs < MONTH_IN_MS) {
    return formatDurationShort(absMs, isPast, WEEK_IN_MS, "w");
  }

  if (absMs < YEAR_IN_MS) {
    return formatDurationShort(absMs, isPast, MONTH_IN_MS, "mo");
  }

  return formatDurationShort(absMs, isPast, YEAR_IN_MS, "y");
};
