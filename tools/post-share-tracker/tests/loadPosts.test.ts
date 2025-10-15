import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const setupLoadPosts = async (files: Record<string, string>) => {
  vi.resetModules();

  let capturedCwd = "";

  const fileMap = new Map(Object.entries(files));

  const globbyMock = vi.fn(async (_pattern: string, options?: { cwd?: string }) => {
    capturedCwd = options?.cwd ?? "";

    return Array.from(fileMap.keys()).map((relativePath) =>
      path.join(capturedCwd, relativePath)
    );
  });

  const readFileMock = vi.fn(async (filepath: string, encoding: string) => {
    if (encoding !== "utf8") {
      throw new Error("loadPosts should read files as utf8");
    }

    if (!capturedCwd) {
      throw new Error("Expected globby to capture cwd before reading files.");
    }

    const relativePath = path
      .relative(capturedCwd, filepath)
      .replace(/\\/g, "/");

    const contents = fileMap.get(relativePath);
    if (contents === undefined) {
      throw new Error(`Unexpected file read for ${filepath}`);
    }

    return contents;
  });

  vi.doMock("globby", () => ({
    globby: globbyMock,
  }));

  vi.doMock("../src/config.js", () => ({
    SOCIAL_CHANNELS: ["twitter", "mastodon", "linkedin"],
    SOCIAL_STATES: ["draft", "planned", "shared"],
    CHANNEL_ACTIVITY_RECENCY_BANDS: [],
    SocialChannel: undefined,
    SocialState: undefined,
  }));

  vi.doMock("node:fs/promises", () => ({
    default: { readFile: readFileMock },
    readFile: readFileMock,
  }));

  const module = await import("../src/loadPosts.js");

  return {
    loadPosts: module.loadPosts,
    globbyMock,
    readFileMock,
  };
};

describe("loadPosts", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  it("parses Markdown posts and normalizes social metadata", async () => {
    const files = {
      "2024/alpha.md": [
        "---",
        'title: " Beta Post  "',
        "social:",
        "  twitter:",
        "    status: shared",
        "    lastShared: 2024-05-01T12:34:56.000Z",
        "    notes: Shared widely",
        "  mastodon:",
        "    status: planned",
        "  linkedin:",
        "    status: invalid",
        "---",
        "Post body",
        "",
      ].join("\n"),
      "drafts/no-title.md": [
        "---",
        "social:",
        "  twitter:",
        "    status: draft",
        "---",
        "Body",
        "",
      ].join("\n"),
    };

    const { loadPosts, globbyMock, readFileMock } = await setupLoadPosts(files);

    const posts = await loadPosts();

    expect(globbyMock).toHaveBeenCalledTimes(1);
    expect(globbyMock).toHaveBeenCalledWith("**/*.md", expect.objectContaining({ absolute: true }));
    expect(readFileMock).toHaveBeenCalledTimes(2);
    expect(posts).toHaveLength(2);

    const [first, second] = posts;

    expect(first).toMatchObject({
      slug: "2024/alpha",
      title: "Beta Post",
    });
    expect(first.filepath).toMatch(/[\\/]2024[\\/]alpha\.md$/);
    expect(first.social).toEqual({
      twitter: {
        status: "shared",
        lastShared: "2024-05-01T12:34:56.000Z",
        notes: "Shared widely",
      },
      mastodon: {
        status: "planned",
      },
    });

    expect(second).toMatchObject({
      slug: "drafts/no-title",
      title: "drafts/no-title",
      social: {
        twitter: {
          status: "draft",
        },
      },
    });
    expect(second.filepath).toMatch(/[\\/]drafts[\\/]no-title\.md$/);
  });
});
