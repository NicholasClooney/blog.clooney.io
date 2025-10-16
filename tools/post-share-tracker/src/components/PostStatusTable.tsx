import React from "react";
import { Box, Text } from "ink";
import { SOCIAL_CHANNELS } from "../config.js";
import type { PostMeta } from "../loadPosts.js";
import { formatStatusLabel, getStatusColor } from "../social/statusDisplay.js";
import { HighlightedText } from "./HighlightedText.js";

export interface PostStatusTableProps {
  post: PostMeta;
  tokens: string[];
  titleColumnWidth: number;
  statusColumnWidth: number;
  isSelected?: boolean;
  position: number;
  indexWidth: number;
}

export const PostStatusHeader: React.FC<{
  titleColumnWidth: number;
  statusColumnWidth: number;
}> = ({ titleColumnWidth, statusColumnWidth }) => (
  <Box>
    <Box width={titleColumnWidth}>
      <Text bold wrap="truncate-end">
        Post
      </Text>
    </Box>
    {SOCIAL_CHANNELS.map((channel) => (
      <Box
        key={channel}
        width={statusColumnWidth}
        alignItems="center"
        justifyContent="center"
      >
        <Text bold wrap="truncate-end">
          {channel}
        </Text>
      </Box>
    ))}
  </Box>
);

export const PostStatusRow: React.FC<PostStatusTableProps> = ({
  post,
  tokens,
  titleColumnWidth,
  statusColumnWidth,
  isSelected = false,
  position,
  indexWidth,
}) => {
  const indexLabel = String(position).padStart(indexWidth, " ");
  const titleValue = `${indexLabel}. ${post.title}`;

  return (
    <Box>
      <Box width={titleColumnWidth}>
        <HighlightedText
          value={titleValue}
          tokens={tokens}
          defaultColor={isSelected ? "cyan" : undefined}
        />
      </Box>
      {SOCIAL_CHANNELS.map((channel) => {
        const status = post.social?.[channel];
        return (
          <Box
            key={channel}
            width={statusColumnWidth}
            alignItems="center"
            justifyContent="center"
          >
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
};
