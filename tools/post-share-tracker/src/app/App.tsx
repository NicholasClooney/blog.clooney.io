import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Text, useInput } from "ink";
import {
  SOCIAL_CHANNELS,
  SOCIAL_STATES,
  type SocialChannel,
  type SocialState,
} from "../config.js";
import type { PostMeta } from "../loadPosts.js";
import { loadPosts } from "../loadPosts.js";
import { savePostSocial } from "../savePostSocial.js";
import { matchesTokens } from "../filtering.js";
import { useFilterTokens } from "../hooks/useFilterTokens.js";
import { buildPostLabel } from "../posts/display.js";
import { summarizeChannelActivity } from "../social/channelActivity.js";
import { formatStatusLabel } from "../social/statusDisplay.js";
import type { SelectItem } from "../components/SelectableList.js";
import { ChannelActivityList } from "../components/ChannelActivityList.js";
import {
  ChannelSelectionView,
  PostSelectionView,
  StatusSelectionView,
} from "./views/index.js";

const TITLE_COLUMN_WIDTH = 40;
const STATUS_COLUMN_WIDTH = 18;
const POINTER_COLUMN_WIDTH = 2;

type Mode = "post" | "channel" | "status" | "saving";

export const App: React.FC = () => {
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

        if (mode === "post") {
          if (postFilter.length > 0) {
            setPostFilter("");
          }
          return;
        }

        if (mode === "channel") {
          if (channelFilter.length > 0) {
            setChannelFilter("");
            return;
          }

          setMode("post");
          setSelectedPostPath(null);
          setSelectedChannel(null);
          setChannelFilter("");
          setStatusFilter("");
          return;
        }

        if (mode === "status") {
          if (statusFilter.length > 0) {
            setStatusFilter("");
            return;
          }

          setMode("channel");
          setSelectedChannel(null);
          setStatusFilter("");
          return;
        }
      }

      if (mode === "post") {
        if ((key.backspace || key.delete) && postFilter.length > 0) {
          setPostFilter((current) => current.slice(0, -1));
          return;
        }

        const isModifierPressed = key.ctrl || key.meta;
        const isNavigationKey =
          key.return ||
          key.upArrow ||
          key.downArrow ||
          key.leftArrow ||
          key.rightArrow ||
          key.pageDown ||
          key.pageUp ||
          key.tab;

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
          key.return ||
          key.upArrow ||
          key.downArrow ||
          key.leftArrow ||
          key.rightArrow ||
          key.pageDown ||
          key.pageUp ||
          key.tab;

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
          key.return ||
          key.upArrow ||
          key.downArrow ||
          key.leftArrow ||
          key.rightArrow ||
          key.pageDown ||
          key.pageUp ||
          key.tab;

        if (!isModifierPressed && !isNavigationKey && input && input >= " ") {
          setStatusFilter((current) => `${current}${input}`);
        }
      }
    },
    [
      channelFilter.length,
      mode,
      postFilter.length,
      statusFilter.length,
    ]
  );

  const postFilterTokens = useFilterTokens(postFilter);
  const channelFilterTokens = useFilterTokens(channelFilter);
  const statusFilterTokens = useFilterTokens(statusFilter);

  const filteredPosts = useMemo(() => {
    if (postFilterTokens.length === 0) {
      return posts;
    }

    return posts.filter((post) => {
      const haystacks = [
        post.title,
        post.slug,
        post.filepath,
        buildPostLabel(post),
        ...SOCIAL_CHANNELS.map((channel) =>
          formatStatusLabel(post.social?.[channel])
        ),
      ].filter((value): value is string => Boolean(value));

      return haystacks.some((value) => matchesTokens(value, postFilterTokens));
    });
  }, [postFilterTokens, posts]);

  const postsByPath = useMemo(() => {
    const map = new Map<string, PostMeta>();
    filteredPosts.forEach((post) => {
      map.set(post.filepath, post);
    });
    return map;
  }, [filteredPosts]);

  const postItems = useMemo<SelectItem<string>[]>(() => {
    return filteredPosts.map((post) => ({
      label: buildPostLabel(post),
      value: post.filepath,
      key: post.filepath,
    }));
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
      const haystacks = [item.value, formatStatusLabel(status), item.label].filter(
        (value): value is string => Boolean(value)
      );

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

  const channelActivitySummaries = useMemo(() => {
    return summarizeChannelActivity(posts);
  }, [posts]);

  const baseReservedRows =
    6 +
    channelActivitySummaries.length +
    (statusMessage ? 1 : 0) +
    (actionError ? 1 : 0);

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

  let interactiveState: React.ReactNode = <Text color="gray">Select a post to begin.</Text>;

  if (mode === "saving") {
    interactiveState = <Text color="yellow">Saving status update…</Text>;
  } else if (mode === "post") {
    interactiveState = (
      <PostSelectionView
        postsByPath={postsByPath}
        items={postItems}
        filterValue={postFilter}
        tokens={postFilterTokens}
        isActive={mode === "post" && actionError === null}
        pointerColumnWidth={POINTER_COLUMN_WIDTH}
        titleColumnWidth={TITLE_COLUMN_WIDTH}
        statusColumnWidth={STATUS_COLUMN_WIDTH}
        baseReservedRows={baseReservedRows}
        onSelect={handlePostSelect}
      />
    );
  } else if (mode === "channel" && selectedPost) {
    interactiveState = (
      <ChannelSelectionView
        selectedPost={selectedPost}
        items={channelItems}
        filterValue={channelFilter}
        tokens={channelFilterTokens}
        isActive={mode === "channel" && actionError === null}
        pointerColumnWidth={POINTER_COLUMN_WIDTH}
        statusColumnWidth={STATUS_COLUMN_WIDTH}
        baseReservedRows={baseReservedRows}
        onSelect={handleChannelSelect}
      />
    );
  } else if (mode === "status" && selectedPost && selectedChannel) {
    interactiveState = (
      <StatusSelectionView
        selectedPost={selectedPost}
        selectedChannel={selectedChannel}
        items={statusItems}
        filterValue={statusFilter}
        tokens={statusFilterTokens}
        isActive={mode === "status" && actionError === null}
        pointerColumnWidth={POINTER_COLUMN_WIDTH}
        statusColumnWidth={STATUS_COLUMN_WIDTH}
        titleColumnWidth={TITLE_COLUMN_WIDTH}
        baseReservedRows={baseReservedRows}
        onSelect={handleStatusSelect}
      />
    );
  }

  return (
    <Box flexDirection="column" height="100%">
      <Text color="cyan">Post Share Tracker</Text>
      <Text>
        Tracking {posts.length} post{posts.length === 1 ? "" : "s"} across{" "}
        {SOCIAL_CHANNELS.length} channel{SOCIAL_CHANNELS.length === 1 ? "" : "s"}.
      </Text>
      <Box marginTop={1} flexDirection="column">
        <Text bold>Channel activity</Text>
        <Box marginTop={1} flexDirection="column">
          <ChannelActivityList
            summaries={channelActivitySummaries}
            statusColumnWidth={STATUS_COLUMN_WIDTH}
          />
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
