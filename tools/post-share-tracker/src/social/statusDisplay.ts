import type { SocialStatus } from "../loadPosts.js";
import {
  formatRelativeTimeFromNowShort,
  parseLastSharedDate,
} from "../utils/time.js";

export const getStatusColor = (status?: SocialStatus): string => {
  if (!status) {
    return "gray";
  }

  switch (status.status) {
    case "shared":
      return "green";
    case "queued":
      return "yellow";
    case "draft":
    default:
      return "magenta";
  }
};

export const formatStatusLabel = (status?: SocialStatus): string => {
  if (!status) {
    return "—";
  }

  const { status: value, lastShared } = status;
  if (!lastShared) {
    return value;
  }

  const parsed = parseLastSharedDate(lastShared);
  if (!parsed) {
    return `${value} (invalid date)`;
  }

  return `${value} (${formatRelativeTimeFromNowShort(parsed)})`;
};
