import { SOCIAL_CHANNELS } from "../config.js";
import type { PostMeta } from "../loadPosts.js";

export const buildChannelSummary = (post: PostMeta): string => {
  return SOCIAL_CHANNELS.map((channel) => {
    const status = post.social?.[channel]?.status ?? "—";
    return `${channel}:${status}`;
  }).join("  ");
};

export const buildPostLabel = (post: PostMeta): string => {
  const summary = buildChannelSummary(post);
  return summary ? `${post.title} — ${summary}` : post.title;
};
