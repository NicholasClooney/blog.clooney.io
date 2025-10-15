import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const setupSavePostSocial = async (fileContents: string) => {
  vi.resetModules();

  const readFileMock = vi.fn(async (filepath: string, encoding: string) => {
    expect(encoding).toBe("utf8");
    return fileContents;
  });

  const writeFileMock = vi.fn(async () => {});

  vi.doMock("../src/config.js", () => ({
    SOCIAL_CHANNELS: ["twitter", "mastodon"],
    SOCIAL_STATES: ["draft", "planned", "shared"],
    CHANNEL_ACTIVITY_RECENCY_BANDS: [],
    SocialChannel: undefined,
    SocialState: undefined,
  }));

  vi.doMock("node:fs/promises", () => ({
    default: { readFile: readFileMock, writeFile: writeFileMock },
    readFile: readFileMock,
    writeFile: writeFileMock,
  }));

  const module = await import("../src/savePostSocial.js");

  return {
    savePostSocial: module.savePostSocial,
    readFileMock,
    writeFileMock,
  };
};

describe("savePostSocial", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  it("updates a channel status, preserving other channels and timestamps automatically", async () => {
    const initialContent = [
      "---",
      "title: Example Post",
      "social:",
      "  mastodon:",
      "    status: planned",
      "  twitter:",
      "    status: draft",
      "---",
      "Body",
      "",
    ].join("\n");

    const { savePostSocial, writeFileMock } = await setupSavePostSocial(initialContent);

    const filepath = path.join(process.cwd(), "posts", "example.md");
    const timestamp = "2024-07-19T00:00:00.000Z";

    const result = await savePostSocial({
      filepath,
      channel: "twitter",
      status: "shared",
      notes: "  Posted soon  ",
      options: {
        autoTimestamp: true,
        timestampFactory: () => timestamp,
      },
    });

    const expectedContent = [
      "---",
      "title: Example Post",
      "social:",
      "  twitter:",
      "    status: shared",
      `    lastShared: ${timestamp}`,
      "    notes: Posted soon",
      "  mastodon:",
      "    status: planned",
      "---",
      "Body",
      "",
    ].join("\n");

    expect(result).toEqual({
      changed: true,
      status: {
        status: "shared",
        lastShared: timestamp,
        notes: "Posted soon",
      },
      content: expectedContent,
    });

    expect(writeFileMock).toHaveBeenCalledTimes(1);
    expect(writeFileMock).toHaveBeenCalledWith(filepath, expectedContent, "utf8");
  });

  it("supports dry-run mode without mutating the source file", async () => {
    const initialContent = [
      "---",
      "title: Draft Post",
      "---",
      "Body",
      "",
    ].join("\n");

    const { savePostSocial, writeFileMock } = await setupSavePostSocial(initialContent);

    const filepath = path.join(process.cwd(), "posts", "draft.md");

    const result = await savePostSocial({
      filepath,
      channel: "twitter",
      status: "draft",
      options: {
        dryRun: true,
      },
    });

    const expectedContent = [
      "---",
      "title: Draft Post",
      "",
      "social:",
      "  twitter:",
      "    status: draft",
      "---",
      "Body",
      "",
    ].join("\n");

    expect(result.changed).toBe(true);
    expect(result.status).toEqual({ status: "draft" });
    expect(result.content).toBe(expectedContent);
    expect(writeFileMock).not.toHaveBeenCalled();
  });

  it("throws when provided an unknown channel", async () => {
    const initialContent = [
      "---",
      "title: Example Post",
      "---",
      "Body",
      "",
    ].join("\n");

    const { savePostSocial, readFileMock, writeFileMock } = await setupSavePostSocial(initialContent);

    const filepath = path.join(process.cwd(), "posts", "example.md");

    await expect(
      // @ts-expect-error intentionally providing an unsupported channel for runtime validation
      savePostSocial({
        filepath,
        channel: "facebook",
        status: "shared",
      })
    ).rejects.toThrow("Unknown social channel: facebook");

    expect(readFileMock).not.toHaveBeenCalled();
    expect(writeFileMock).not.toHaveBeenCalled();
  });
});
