import React from "react";
import { Box, Text } from "ink";
import type { SelectItem } from "../../components/SelectableList.js";
import { SelectableList } from "../../components/SelectableList.js";
import { PostStatusHeader, PostStatusRow } from "../../components/PostStatusTable.js";
import type { PostMeta } from "../../loadPosts.js";

export interface PostSelectionViewProps {
  postsByPath: Map<string, PostMeta>;
  items: SelectItem<string>[];
  filterValue: string;
  tokens: string[];
  isActive: boolean;
  pointerColumnWidth: number;
  titleColumnWidth: number;
  statusColumnWidth: number;
  onSelect: (item: SelectItem<string>) => void;
}

export const PostSelectionView: React.FC<PostSelectionViewProps> = ({
  postsByPath,
  items,
  filterValue,
  tokens,
  isActive,
  pointerColumnWidth,
  titleColumnWidth,
  statusColumnWidth,
  onSelect,
}) => (
  <Box flexDirection="column">
    <Text>Select a post to update (Enter).</Text>
    <Text color="gray">
      Type to filter by title/slug. Backspace edits. Esc clears the filter.
    </Text>
    {filterValue ? <Text color="gray">Filter: “{filterValue}”</Text> : null}
    <Box marginTop={1} flexDirection="column">
      <Box flexDirection="row">
        <Box width={pointerColumnWidth} />
        <PostStatusHeader
          titleColumnWidth={titleColumnWidth}
          statusColumnWidth={statusColumnWidth}
        />
      </Box>
      <SelectableList<string>
        items={items}
        isActive={isActive}
        onSelect={onSelect}
        itemKeyPrefix="post"
        pointerColumnWidth={pointerColumnWidth}
        emptyPlaceholder={
          <Text color="yellow">
            No posts match the filter. Adjust your search or press Esc to clear.
          </Text>
        }
        renderItem={(item, isSelected) => {
          const post = postsByPath.get(item.value);
          return post ? (
            <PostStatusRow
              post={post}
              tokens={tokens}
              isSelected={isSelected}
              titleColumnWidth={titleColumnWidth}
              statusColumnWidth={statusColumnWidth}
            />
          ) : (
            <Text>{item.label}</Text>
          );
        }}
      />
    </Box>
  </Box>
);
