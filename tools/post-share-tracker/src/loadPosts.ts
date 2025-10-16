import { globby } from "globby";
import matter from "gray-matter";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SOCIAL_CHANNELS, SOCIAL_STATES, SocialChannel, SocialState } from "./config.js";

export interface SocialStatus {
  status: SocialState;
  lastShared?: string;
  notes?: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  filepath: string;
  createdAt?: string;
  social?: Partial<Record<SocialChannel, SocialStatus>>;
}

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
const postsDir = path.join(repoRoot, "posts");

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const parseSocialStatus = (value: unknown): SocialStatus | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const status = value.status;
  if (typeof status !== "string" || !SOCIAL_STATES.includes(status as SocialState)) {
    return undefined;
  }

  const parsed: SocialStatus = { status };

  const rawLastShared = value.lastShared;
  if (typeof rawLastShared === "string") {
    parsed.lastShared = rawLastShared;
  } else if (rawLastShared instanceof Date) {
    const timestamp = rawLastShared.getTime();
    if (!Number.isNaN(timestamp)) {
      parsed.lastShared = rawLastShared.toISOString();
    }
  }

  if (typeof value.notes === "string") {
    parsed.notes = value.notes;
  }

  return parsed;
};

const isValidDate = (value: unknown): value is Date => {
  return value instanceof Date && !Number.isNaN(value.getTime());
};

const parseDateField = (value: unknown): Date | undefined => {
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
    return undefined;
  }

  if (isValidDate(value)) {
    return value;
  }

  return undefined;
};

export const loadPosts = async (): Promise<PostMeta[]> => {
  const files = await globby("**/*.md", { cwd: postsDir, absolute: true });

  const posts = await Promise.all(
    files.map(async (filepath) => {
      const [fileContents, stats] = await Promise.all([
        fs.readFile(filepath, "utf8"),
        fs.stat(filepath),
      ]);
      const { data } = matter(fileContents);

      const relativePath = path.relative(postsDir, filepath);
      const slug = relativePath.replace(/\\/g, "/").replace(/\.md$/, "");
      const title = typeof data.title === "string" && data.title.trim() !== "" ? data.title.trim() : slug;

      let social: PostMeta["social"];
      if (isRecord(data.social)) {
        const entries = SOCIAL_CHANNELS.map((channel) => {
          const parsed = parseSocialStatus(data.social?.[channel]);
          return parsed ? [channel, parsed] : undefined;
        }).filter((entry): entry is [SocialChannel, SocialStatus] => Boolean(entry));

        if (entries.length > 0) {
          social = Object.fromEntries(entries) as PostMeta["social"];
        }
      }

      const dateField =
        parseDateField(data.date) ?? parseDateField(data.createdAt);

      const createdAtDate =
        dateField ??
        (isValidDate(stats.birthtime) ? stats.birthtime : undefined) ??
        (isValidDate(stats.mtime) ? stats.mtime : undefined);

      const createdAt = createdAtDate?.toISOString();

      return {
        slug,
        title,
        filepath,
        createdAt,
        social,
      } satisfies PostMeta;
    })
  );

  return posts.sort((a, b) => {
    const aTime = a.createdAt ? Date.parse(a.createdAt) : Number.NEGATIVE_INFINITY;
    const bTime = b.createdAt ? Date.parse(b.createdAt) : Number.NEGATIVE_INFINITY;

    if (aTime !== bTime) {
      return bTime - aTime;
    }

    return a.title.localeCompare(b.title);
  });
};
