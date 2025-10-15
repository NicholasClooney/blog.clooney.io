import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Text, render, useInput } from "ink";
import {
  SOCIAL_CHANNELS,
  SOCIAL_STATES,
  CHANNEL_ACTIVITY_RECENCY_BANDS,
  type SocialChannel,
  type SocialState,
} from "./config.js";
import type { PostMeta, SocialStatus } from "./loadPosts.js";
import { loadPosts } from "./loadPosts.js";
import { savePostSocial } from "./savePostSocial.js";

const TITLE_COLUMN_WIDTH = 40;
const STATUS_COLUMN_WIDTH = 18;
const POINTER_COLUMN_WIDTH = 2;

const MINUTE_IN_MS = 60 * 1000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const WEEK_IN_MS = 7 * DAY_IN_MS;
const MONTH_IN_MS = 30 * DAY_IN_MS;
const YEAR_IN_MS = 365 * DAY_IN_MS;

const parseLastSharedDate = (value: string): Date | null => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatRelativeTimeFromNow = (date: Date, now = new Date()): string => {
  const timestamp = date.getTime();
  if (Number.isNaN(timestamp)) {
    return "invalid date";
  }

  const diffMs = now.getTime() - timestamp;
  const absMs = Math.abs(diffMs);

  if (absMs < MINUTE_IN_MS) {
    return diffMs >= 0 ? "just now" : "in under a minute";
  }

  const format = (value: number, unit: string): string => {
    const wholeUnits = Math.max(1, Math.floor(value));
    const plural = wholeUnits === 1 ? "" : "s";
    if (diffMs >= 0) {
      return `${wholeUnits} ${unit}${plural} ago`;
    }
    return `in ${wholeUnits} ${unit}${plural}`;
  };

  if (absMs < HOUR_IN_MS) {
    return format(absMs / MINUTE_IN_MS, "minute");
  }

  if (absMs < DAY_IN_MS) {
    return format(absMs / HOUR_IN_MS, "hour");
  }

  if (absMs < WEEK_IN_MS) {
    return format(absMs / DAY_IN_MS, "day");
  }

  if (absMs < MONTH_IN_MS) {
    return format(absMs / WEEK_IN_MS, "week");
  }

  if (absMs < YEAR_IN_MS) {
    return format(absMs / MONTH_IN_MS, "month");
  }

  return format(absMs / YEAR_IN_MS, "year");
};

type Mode = "post" | "channel" | "status" | "saving";

type SelectItem<Value> = {
  label: string;
  value: Value;
  key?: string;
};

type ChannelActivitySummary = {
  channel: SocialChannel;
  display: string;
  color: string;
  exactTimestamp?: string | null;
};

const buildChannelSummary = (post: PostMeta): string => {
  return SOCIAL_CHANNELS.map((channel) => {
    const status = post.social?.[channel]?.status ?? "—";
    return `${channel}:${status}`;
  }).join("  ");
};

const buildPostLabel = (post: PostMeta): string => {
  const summary = buildChannelSummary(post);
  return summary ? `${post.title} — ${summary}` : post.title;
};

const toFilterTokens = (filter: string): string[] => {
  return filter
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
};

type TokenMatchRange = {
  start: number;
  end: number;
};

const findSequentialTokenRanges = (value: string, tokens: string[]): TokenMatchRange[] | null => {
  const normalizedTokens = tokens
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  if (normalizedTokens.length === 0) {
    return [];
  }

  const haystack = value.toLowerCase();
  let searchIndex = 0;
  const ranges: TokenMatchRange[] = [];

  for (const token of normalizedTokens) {
    const lowerToken = token.toLowerCase();
    const foundIndex = haystack.indexOf(lowerToken, searchIndex);
    if (foundIndex === -1) {
      return null;
    }

    ranges.push({
      start: foundIndex,
      end: foundIndex + lowerToken.length,
    });

    searchIndex = foundIndex + lowerToken.length;
  }

  return ranges;
};

const matchesTokens = (value: string, tokens: string[]): boolean => {
  return findSequentialTokenRanges(value, tokens) !== null;
};

const HighlightedText: React.FC<{
  value: string;
  tokens: string[];
  defaultColor?: string;
  defaultBold?: boolean;
  highlightColor?: string;
}> = ({ value, tokens, defaultColor, defaultBold = false, highlightColor = "yellow" }) => {
  const matchRanges = useMemo(() => {
    return findSequentialTokenRanges(value, tokens);
  }, [tokens, value]);

  const segments = useMemo(() => {
    if (!matchRanges || matchRanges.length === 0) {
      return [{ text: value, isMatch: false }];
    }

    const parts: Array<{ text: string; isMatch: boolean }> = [];
    let lastIndex = 0;
    for (const range of matchRanges) {
      if (range.start > lastIndex) {
        parts.push({
          text: value.slice(lastIndex, range.start),
          isMatch: false,
        });
      }

      parts.push({
        text: value.slice(range.start, range.end),
        isMatch: true,
      });

      lastIndex = range.end;
    }

    if (lastIndex < value.length) {
      parts.push({ text: value.slice(lastIndex), isMatch: false });
    }

    return parts;
  }, [matchRanges, value]);

  return (
    <Text color={defaultColor} bold={defaultBold}>
      {segments.map((segment, index) =>
        segment.isMatch ? (
          <Text key={`match-${index}`} color={highlightColor} bold>
            {segment.text}
          </Text>
        ) : (
          <React.Fragment key={`segment-${index}`}>{segment.text}</React.Fragment>
        )
      )}
    </Text>
  );
};

interface SelectableListProps<Value> {
  items: SelectItem<Value>[];
  isActive: boolean;
  onSelect: (item: SelectItem<Value>) => void | Promise<void>;
  itemKeyPrefix: string;
  emptyPlaceholder?: React.ReactNode;
  renderItem?: (item: SelectItem<Value>, isSelected: boolean) => React.ReactNode;
}

const SelectableList = <Value,>({
  items,
  isActive,
  onSelect,
  itemKeyPrefix,
  emptyPlaceholder,
  renderItem,
}: SelectableListProps<Value>) => {
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    setHighlightIndex((current) => {
      if (items.length === 0) {
        return 0;
      }

      return Math.min(current, items.length - 1);
    });
  }, [items]);

  useEffect(() => {
    if (items.length === 0) {
      setHighlightIndex(0);
    }
  }, [items.length]);

  useInput(
    (input, key) => {
      if (items.length === 0) {
        return;
      }

      if (key.upArrow || input === "k") {
        setHighlightIndex((current) => {
          if (current === 0) {
            return items.length - 1;
          }

          return current - 1;
        });
        return;
      }

      if (key.downArrow || input === "j") {
        setHighlightIndex((current) => (current + 1) % items.length);
        return;
      }

      if (key.return) {
        const item = items[highlightIndex];
        if (item) {
          void onSelect(item);
        }
      }
    },
    { isActive }
  );

  if (items.length === 0) {
    return emptyPlaceholder ? <>{emptyPlaceholder}</> : null;
  }

  return (
    <Box flexDirection="column">
      {items.map((item, index) => {
        const isSelected = index === highlightIndex;
        const pointerColor = isSelected ? "cyan" : "gray";
        return (
          <Box key={item.key ?? `${itemKeyPrefix}-${index}`} flexDirection="row">
            <Box width={POINTER_COLUMN_WIDTH}>
              <Text color={pointerColor}>{isSelected ? "›" : " "}</Text>
            </Box>
            <Box flexGrow={1}>
              {renderItem ? (
                renderItem(item, isSelected)
              ) : (
                <Text color={isSelected ? "cyan" : undefined}>{item.label}</Text>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

const getStatusColor = (status?: SocialStatus): string => {
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

const formatStatusLabel = (status?: SocialStatus): string => {
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

  return `${value} (${formatRelativeTimeFromNow(parsed)})`;
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

const HeaderRow: React.FC = () => (
  <Box>
    <Box width={TITLE_COLUMN_WIDTH}>
      <Text bold>Post</Text>
    </Box>
    {SOCIAL_CHANNELS.map((channel) => (
      <Box key={channel} width={STATUS_COLUMN_WIDTH}>
        <Text bold>{channel}</Text>
      </Box>
    ))}
  </Box>
);

const PostRow: React.FC<{ post: PostMeta; tokens: string[]; isSelected?: boolean }> = ({
  post,
  tokens,
  isSelected = false,
}) => (
  <Box>
    <Box width={TITLE_COLUMN_WIDTH}>
      <HighlightedText
        value={post.title}
        tokens={tokens}
        defaultColor={isSelected ? "cyan" : undefined}
      />
    </Box>
    {SOCIAL_CHANNELS.map((channel) => {
      const status = post.social?.[channel];
      return (
        <Box key={channel} width={STATUS_COLUMN_WIDTH}>
          <HighlightedText
            value={formatStatusLabel(status)}
            tokens={tokens}
            defaultColor={getStatusColor(status)}
          />
        </Box>
      );
    })}
  </Box>
);

const App: React.FC = () => {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("post");
  const [selectedPostPath, setSelectedPostPath] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<SocialChannel | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [postFilter, setPostFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchPosts = useCallback(async () => {
    const loaded = await loadPosts();
    setPosts(loaded);
    setLoadError(null);
    return loaded;
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        await fetchPosts();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setLoadError(message);
      } finally {
        setIsInitialLoading(false);
      }
    };

    void load();
  }, [fetchPosts]);

  const selectedPost = useMemo<PostMeta | null>(() => {
    return posts.find((post) => post.filepath === selectedPostPath) ?? null;
  }, [posts, selectedPostPath]);

  useEffect(() => {
    if (selectedPostPath && !selectedPost) {
      setSelectedPostPath(null);
      setSelectedChannel(null);
      setChannelFilter("");
      setStatusFilter("");
      setMode("post");
    }
  }, [selectedPostPath, selectedPost]);

  useInput(
    (input, key) => {
      if (key.escape) {
        setActionError(null);
        setStatusMessage(null);
        if (mode === "post" && postFilter.length > 0) {
          setPostFilter("");
          return;
        }
        if (mode === "channel" && channelFilter.length > 0) {
          setChannelFilter("");
          return;
        }
        if (mode === "status" && statusFilter.length > 0) {
          setStatusFilter("");
          return;
        }
        if (mode === "status") {
          setMode("channel");
          setSelectedChannel(null);
          setStatusFilter("");
          return;
        }

        if (mode === "channel") {
          setMode("post");
          setSelectedPostPath(null);
          setSelectedChannel(null);
          setChannelFilter("");
          setStatusFilter("");
        }
      }

      if (mode === "post") {
        if ((key.backspace || key.delete) && postFilter.length > 0) {
          setPostFilter((current) => current.slice(0, -1));
          return;
        }

        const isModifierPressed = key.ctrl || key.meta;
        const isNavigationKey =
          key.return || key.upArrow || key.downArrow || key.leftArrow || key.rightArrow || key.pageDown || key.pageUp || key.tab;

        if (!isModifierPressed && !isNavigationKey && input && input >= " ") {
          setPostFilter((current) => `${current}${input}`);
        }
        return;
      }

      if (mode === "channel") {
        if ((key.backspace || key.delete) && channelFilter.length > 0) {
          setChannelFilter((current) => current.slice(0, -1));
          return;
        }

        const isModifierPressed = key.ctrl || key.meta;
        const isNavigationKey =
          key.return || key.upArrow || key.downArrow || key.leftArrow || key.rightArrow || key.pageDown || key.pageUp || key.tab;

        if (!isModifierPressed && !isNavigationKey && input && input >= " ") {
          setChannelFilter((current) => `${current}${input}`);
        }
        return;
      }

      if (mode === "status") {
        if ((key.backspace || key.delete) && statusFilter.length > 0) {
          setStatusFilter((current) => current.slice(0, -1));
          return;
        }

        const isModifierPressed = key.ctrl || key.meta;
        const isNavigationKey =
          key.return || key.upArrow || key.downArrow || key.leftArrow || key.rightArrow || key.pageDown || key.pageUp || key.tab;

        if (!isModifierPressed && !isNavigationKey && input && input >= " ") {
          setStatusFilter((current) => `${current}${input}`);
        }
      }
    },
    {
      isActive:
        !isInitialLoading && loadError === null && posts.length > 0 && mode !== "saving",
    }
  );

  const filterTokens = useMemo(
    () => toFilterTokens(postFilter),
    [postFilter]
  );

  const channelFilterTokens = useMemo(
    () => toFilterTokens(channelFilter),
    [channelFilter]
  );

  const statusFilterTokens = useMemo(
    () => toFilterTokens(statusFilter),
    [statusFilter]
  );

  const filteredPosts = useMemo(() => {
    if (filterTokens.length === 0) {
      return posts;
    }

    return posts.filter((post) => {
      const summary = buildChannelSummary(post);
      const haystacks = [
        post.title,
        post.slug,
        post.filepath,
        summary,
        ...SOCIAL_CHANNELS.map((channel) => post.social?.[channel]?.status ?? ""),
      ].filter((value): value is string => Boolean(value));

      return haystacks.some((value) => matchesTokens(value, filterTokens));
    });
  }, [filterTokens, posts]);

  const postsByPath = useMemo(() => {
    const map = new Map<string, PostMeta>();
    filteredPosts.forEach((post) => {
      map.set(post.filepath, post);
    });
    return map;
  }, [filteredPosts]);

  const postItems = useMemo<SelectItem<string>[]>(() => {
    return filteredPosts.map((post) => {
      return {
        label: buildPostLabel(post),
        value: post.filepath,
        key: post.filepath,
      };
    });
  }, [filteredPosts]);

  const channelItems = useMemo<SelectItem<SocialChannel>[]>(() => {
    if (!selectedPost) {
      return [];
    }

    const allChannels = SOCIAL_CHANNELS.map((channel) => {
      const status = selectedPost.social?.[channel];
      return {
        label: `${channel} — ${formatStatusLabel(status)}`,
        value: channel,
        key: `${selectedPost.filepath}:${channel}`,
      };
    });

    if (channelFilterTokens.length === 0) {
      return allChannels;
    }

    return allChannels.filter((item) => {
      const status = selectedPost.social?.[item.value];
      const haystacks = [
        item.value,
        formatStatusLabel(status),
        item.label,
      ].filter((value): value is string => Boolean(value));

      return haystacks.some((value) => matchesTokens(value, channelFilterTokens));
    });
  }, [channelFilterTokens, selectedPost]);

  const statusItems = useMemo<SelectItem<SocialState>[]>(() => {
    if (!selectedPost || !selectedChannel) {
      return [];
    }

    const currentStatus = selectedPost.social?.[selectedChannel]?.status;

    const allStatuses = SOCIAL_STATES.map((state) => ({
      label: state === currentStatus ? `${state} (current)` : state,
      value: state,
      key: state,
    }));

    if (statusFilterTokens.length === 0) {
      return allStatuses;
    }

    return allStatuses.filter((item) => {
      const haystacks = [item.value, item.label];
      return haystacks.some((value) => matchesTokens(value, statusFilterTokens));
    });
  }, [selectedChannel, selectedPost, statusFilterTokens]);

  const channelActivitySummaries = useMemo<ChannelActivitySummary[]>(() => {
    const now = new Date();

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
  }, [posts]);

  const handlePostSelect = (item: SelectItem<string>) => {
    setSelectedPostPath(item.value);
    setSelectedChannel(null);
    setMode("channel");
    setStatusMessage(null);
    setActionError(null);
    setPostFilter("");
    setChannelFilter("");
    setStatusFilter("");
  };

  const handleChannelSelect = (item: SelectItem<SocialChannel>) => {
    setSelectedChannel(item.value);
    setMode("status");
    setStatusMessage(null);
    setActionError(null);
    setStatusFilter("");
  };

  const handleStatusSelect = async (item: SelectItem<SocialState>) => {
    if (!selectedPost || !selectedChannel) {
      setActionError("Select a post and channel before choosing a status.");
      setMode(selectedPost ? "channel" : "post");
      return;
    }

    setMode("saving");
    setActionError(null);
    setStatusMessage(null);

    try {
      const result = await savePostSocial({
        filepath: selectedPost.filepath,
        channel: selectedChannel,
        status: item.value,
        options: {
          autoTimestamp: true,
        },
      });

      try {
        await fetchPosts();
      } catch (reloadError) {
        const message =
          reloadError instanceof Error ? reloadError.message : String(reloadError);
        setActionError(
          `Status updated but refreshing posts failed: ${message}`
        );
        return;
      }

      if (result.changed) {
        const parts = [
          selectedPost.title,
          `${selectedChannel} → ${result.status.status}`,
        ];

        if (result.status.lastShared) {
          parts.push(`lastShared ${result.status.lastShared}`);
        }

        setStatusMessage(`Updated ${parts.join(" · ")}`);
      } else {
        setStatusMessage(
          `No changes written. ${selectedChannel} already ${result.status.status}.`
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setActionError(message);
    } finally {
      setMode("channel");
      setSelectedChannel(null);
      setStatusFilter("");
    }
  };

  if (isInitialLoading) {
    return <Text>Loading posts…</Text>;
  }

  if (loadError) {
    return (
      <Box flexDirection="column">
        <Text color="red">Failed to load posts:</Text>
        <Text color="red">{loadError}</Text>
        <Text color="gray">Fix the issue and restart the tracker.</Text>
      </Box>
    );
  }

  if (posts.length === 0) {
    return <Text>No posts found.</Text>;
  }

  const interactiveState = (() => {
    if (mode === "saving") {
      return <Text color="yellow">Saving status update…</Text>;
    }

    if (mode === "post") {
      return (
        <Box flexDirection="column">
          <Text>Select a post to update (Enter).</Text>
          <Text color="gray">
            Type to filter by title/slug. Backspace edits. Esc clears the filter.
          </Text>
          {postFilter ? (
            <Text color="gray">Filter: “{postFilter}”</Text>
          ) : null}
          <Box marginTop={1} flexDirection="column">
            <Box flexDirection="row">
              <Box width={POINTER_COLUMN_WIDTH} />
              <HeaderRow />
            </Box>
            <SelectableList<string>
              items={postItems}
              isActive={mode === "post" && actionError === null}
              onSelect={handlePostSelect}
              itemKeyPrefix="post"
              emptyPlaceholder={
                <Text color="yellow">
                  No posts match the filter. Adjust your search or press Esc to clear.
                </Text>
              }
              renderItem={(item, isSelected) => {
                const postForRow = postsByPath.get(item.value);
                if (!postForRow) {
                  return (
                    <HighlightedText
                      value={item.label}
                      tokens={filterTokens}
                      defaultColor={isSelected ? "cyan" : undefined}
                    />
                  );
                }

                return (
                  <PostRow post={postForRow} tokens={filterTokens} isSelected={isSelected} />
                );
              }}
            />
          </Box>
        </Box>
      );
    }

    if (mode === "channel" && selectedPost) {
      return (
        <Box flexDirection="column">
          <Text>
            Post: <Text bold>{selectedPost.title}</Text>
          </Text>
          <Text>
            Select a channel to update (Enter). Type to filter. Backspace edits. Esc clears the filter, then backs out.
          </Text>
          {channelFilter ? (
            <Text color="gray">Filter: “{channelFilter}”</Text>
          ) : null}
          <Box marginTop={1} flexDirection="column">
            <Box flexDirection="row">
              <Box width={POINTER_COLUMN_WIDTH} />
              <Box width={STATUS_COLUMN_WIDTH}>
                <Text bold>Channel</Text>
              </Box>
              <Box width={STATUS_COLUMN_WIDTH}>
                <Text bold>Status</Text>
              </Box>
            </Box>
            <SelectableList<SocialChannel>
              items={channelItems}
              isActive={mode === "channel" && actionError === null}
              onSelect={handleChannelSelect}
              itemKeyPrefix={`channel-${selectedPost.filepath}`}
              emptyPlaceholder={
                <Text color="yellow">
                  No channels match the filter. Adjust your search or press Esc to clear.
                </Text>
              }
              renderItem={(item, isSelected) => {
                const status = selectedPost.social?.[item.value];
                return (
                  <Box flexDirection="row">
                    <Box width={STATUS_COLUMN_WIDTH}>
                      <HighlightedText
                        value={item.value}
                        tokens={channelFilterTokens}
                        defaultColor={isSelected ? "cyan" : undefined}
                      />
                    </Box>
                    <Box width={STATUS_COLUMN_WIDTH}>
                      <HighlightedText
                        value={formatStatusLabel(status)}
                        tokens={channelFilterTokens}
                        defaultColor={getStatusColor(status)}
                      />
                    </Box>
                  </Box>
                );
              }}
            />
          </Box>
        </Box>
      );
    }

    if (mode === "status" && selectedPost && selectedChannel) {
      const currentStatus = selectedPost.social?.[selectedChannel];
      return (
        <Box flexDirection="column">
          <Text>
            Channel: <Text bold>{selectedChannel}</Text>{" "}
            <Text color="gray">{formatStatusLabel(currentStatus)}</Text>
          </Text>
          <Text>
            Select a new status (Enter). Type to filter. Backspace edits. Esc clears the filter, then reselects the channel.
          </Text>
          {statusFilter ? (
            <Text color="gray">Filter: “{statusFilter}”</Text>
          ) : null}
          <Box marginTop={1} flexDirection="column">
            <Box flexDirection="row">
              <Box width={POINTER_COLUMN_WIDTH} />
              <Box width={STATUS_COLUMN_WIDTH}>
                <Text bold>Status</Text>
              </Box>
              <Box width={TITLE_COLUMN_WIDTH}>
                <Text bold>Details</Text>
              </Box>
            </Box>
            <SelectableList<SocialState>
              items={statusItems}
              isActive={mode === "status" && actionError === null}
              onSelect={handleStatusSelect}
              itemKeyPrefix={`status-${selectedChannel}`}
              emptyPlaceholder={
                <Text color="yellow">
                  No statuses match the filter. Adjust your search or press Esc to clear.
                </Text>
              }
              renderItem={(item, isSelected) => {
                const isCurrent = item.value === currentStatus?.status;
                return (
                  <Box flexDirection="row">
                    <Box width={STATUS_COLUMN_WIDTH}>
                      <HighlightedText
                        value={item.value}
                        tokens={statusFilterTokens}
                        defaultColor={isSelected ? "cyan" : undefined}
                      />
                    </Box>
                    <Box width={TITLE_COLUMN_WIDTH}>
                      <Text color={isCurrent ? "green" : "gray"}>
                        {isCurrent ? "Already current status" : "Set channel to this state"}
                      </Text>
                    </Box>
                  </Box>
                );
              }}
            />
          </Box>
        </Box>
      );
    }

    return <Text color="gray">Select a post to begin.</Text>;
  })();

  return (
    <Box flexDirection="column">
      <Text color="cyan">Post Share Tracker</Text>
      <Text>
        Tracking {posts.length} post{posts.length === 1 ? "" : "s"} across{" "}
        {SOCIAL_CHANNELS.length} channel{SOCIAL_CHANNELS.length === 1 ? "" : "s"}.
      </Text>
      <Box marginTop={1} flexDirection="column">
        <Text bold>Channel activity</Text>
        <Box marginTop={1} flexDirection="column">
          {channelActivitySummaries.map((summary) => (
            <Box key={summary.channel} flexDirection="row">
              <Box width={STATUS_COLUMN_WIDTH}>
                <Text bold>{summary.channel}</Text>
              </Box>
              <Box flexDirection="row">
                <Text color={summary.color}>{summary.display}</Text>
                {summary.exactTimestamp ? (
                  <Text color="gray"> ({summary.exactTimestamp})</Text>
                ) : null}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      <Box marginTop={1} flexDirection="column">
        {statusMessage && <Text color="green">{statusMessage}</Text>}
        {actionError && <Text color="red">{actionError}</Text>}
        {interactiveState}
      </Box>
    </Box>
  );
};

render(<App />);
