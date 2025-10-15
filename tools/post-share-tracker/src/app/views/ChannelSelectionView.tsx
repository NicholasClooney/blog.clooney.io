import React from "react";
import { Box, Text } from "ink";
import type { SelectItem } from "../../components/SelectableList.js";
import { SelectableList } from "../../components/SelectableList.js";
import { HighlightedText } from "../../components/HighlightedText.js";
import type { PostMeta } from "../../loadPosts.js";
import type { SocialChannel } from "../../config.js";
import { formatStatusLabel, getStatusColor } from "../../social/statusDisplay.js";

export interface ChannelSelectionViewProps {
  selectedPost: PostMeta;
  items: SelectItem<SocialChannel>[];
  filterValue: string;
  tokens: string[];
  isActive: boolean;
  pointerColumnWidth: number;
  statusColumnWidth: number;
  onSelect: (item: SelectItem<SocialChannel>) => void;
}

export const ChannelSelectionView: React.FC<ChannelSelectionViewProps> = ({
  selectedPost,
  items,
  filterValue,
  tokens,
  isActive,
  pointerColumnWidth,
  statusColumnWidth,
  onSelect,
}) => (
  <Box flexDirection="column">
    <Text>
      Post: <Text bold>{selectedPost.title}</Text>
    </Text>
    <Text>
      Select a channel (Enter). Type to filter. Backspace edits. Esc clears the
      filter, then reselects the post.
    </Text>
    {filterValue ? <Text color="gray">Filter: “{filterValue}”</Text> : null}
    <Box marginTop={1} flexDirection="column">
      <SelectableList<SocialChannel>
        items={items}
        isActive={isActive}
        onSelect={onSelect}
        itemKeyPrefix={`channel-${selectedPost.filepath}`}
        pointerColumnWidth={pointerColumnWidth}
        emptyPlaceholder={
          <Text color="yellow">
            No channels match the filter. Adjust your search or press Esc to clear.
          </Text>
        }
        renderItem={(item, isSelected) => {
          const status = selectedPost.social?.[item.value];
          return (
            <Box flexDirection="row">
              <Box width={statusColumnWidth}>
                <HighlightedText
                  value={item.value}
                  tokens={tokens}
                  defaultColor={isSelected ? "cyan" : undefined}
                />
              </Box>
              <Box width={statusColumnWidth}>
                <HighlightedText
                  value={formatStatusLabel(status)}
                  tokens={tokens}
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
