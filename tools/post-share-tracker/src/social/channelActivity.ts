import {
  CHANNEL_ACTIVITY_RECENCY_BANDS,
  SOCIAL_CHANNELS,
  type SocialChannel,
} from "../config.js";
import type { PostMeta } from "../loadPosts.js";
import { formatRelativeTimeFromNow, parseLastSharedDate } from "../utils/time.js";

export type ChannelActivitySummary = {
  channel: SocialChannel;
  display: string;
  color: string;
  exactTimestamp?: string | null;
};

const getRelativeAgeColor = (date: Date, now = new Date()): string => {
  const diffMs = now.getTime() - date.getTime();
  const ageMs = diffMs < 0 ? 0 : diffMs;

  for (const band of CHANNEL_ACTIVITY_RECENCY_BANDS) {
    const limit = band.maxAgeMs ?? Number.POSITIVE_INFINITY;
    if (ageMs <= limit) {
      return band.color;
    }
  }

  return "gray";
};

export const summarizeChannelActivity = (
  posts: PostMeta[],
  now = new Date()
): ChannelActivitySummary[] => {
  return SOCIAL_CHANNELS.map((channel) => {
    let latestDate: Date | null = null;
    let latestRaw: string | null = null;
    let invalidSample: string | null = null;

    for (const post of posts) {
      const lastShared = post.social?.[channel]?.lastShared;
      if (!lastShared) {
        continue;
      }

      const parsed = parseLastSharedDate(lastShared);
      if (!parsed) {
        if (!invalidSample) {
          invalidSample = lastShared;
        }
        continue;
      }

      if (!latestDate || parsed.getTime() > latestDate.getTime()) {
        latestDate = parsed;
        latestRaw = lastShared;
      }
    }

    if (latestDate && latestRaw) {
      return {
        channel,
        display: formatRelativeTimeFromNow(latestDate, now),
        exactTimestamp: latestRaw,
        color: getRelativeAgeColor(latestDate, now),
      };
    }

    if (invalidSample) {
      return {
        channel,
        display: `invalid date (${invalidSample})`,
        exactTimestamp: null,
        color: "yellow",
      };
    }

    return {
      channel,
      display: "never shared",
      exactTimestamp: null,
      color: "gray",
    };
  });
};
