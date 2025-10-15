const MINUTE_IN_MS = 60 * 1000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const WEEK_IN_MS = 7 * DAY_IN_MS;
const MONTH_IN_MS = 30 * DAY_IN_MS;
const YEAR_IN_MS = 365 * DAY_IN_MS;

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

export const parseDurationToMs = (value: unknown, label: string): number => {
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
