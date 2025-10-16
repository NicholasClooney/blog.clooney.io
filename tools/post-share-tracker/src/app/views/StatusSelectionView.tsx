import React, { useMemo } from "react";
import { Box, Text } from "ink";
import type { SelectItem } from "../../components/SelectableList.js";
import { SelectableList } from "../../components/SelectableList.js";
import { HighlightedText } from "../../components/HighlightedText.js";
import type { PostMeta } from "../../loadPosts.js";
import type { SocialChannel, SocialState } from "../../config.js";
import { formatStatusLabel } from "../../social/statusDisplay.js";
import { useStdoutDimensions } from "../../hooks/useStdoutDimensions.js";
import { estimateWrappedLines, estimateWidthRows } from "../../utils/terminalLayout.js";

export interface StatusSelectionViewProps {
  selectedPost: PostMeta;
  selectedChannel: SocialChannel;
  items: SelectItem<SocialState>[];
  filterValue: string;
  tokens: string[];
  isActive: boolean;
  pointerColumnWidth: number;
  statusColumnWidth: number;
  titleColumnWidth: number;
  onSelect: (item: SelectItem<SocialState>) => void | Promise<void>;
  baseReservedRows: number;
}

export const StatusSelectionView: React.FC<StatusSelectionViewProps> = ({
  selectedPost,
  selectedChannel,
  items,
  filterValue,
  tokens,
  isActive,
  pointerColumnWidth,
  statusColumnWidth,
  titleColumnWidth,
  onSelect,
  baseReservedRows,
}) => {
  const currentStatus = selectedPost.social?.[selectedChannel];
  const { columns } = useStdoutDimensions();
  const currentStatusLabel = formatStatusLabel(currentStatus);

  const headingRows = useMemo(() => {
    const channelLine = estimateWrappedLines(
      `Channel: ${selectedChannel}${currentStatusLabel ? ` ${currentStatusLabel}` : ""}`,
      columns
    );

    const instructionsLine = estimateWrappedLines(
      "Select a new status (Enter). Type to filter. Backspace edits. Esc clears the filter, then reselects the channel.",
      columns
    );

    const filterLines = filterValue
      ? estimateWrappedLines(`Filter: “${filterValue}”`, columns)
      : 0;

    const headerWidth = pointerColumnWidth + statusColumnWidth + titleColumnWidth;
    const headerLines = estimateWidthRows(headerWidth, columns);

    return channelLine + instructionsLine + filterLines + 1 + headerLines;
  }, [
    columns,
    currentStatusLabel,
    filterValue,
    pointerColumnWidth,
    selectedChannel,
    statusColumnWidth,
    titleColumnWidth,
  ]);

  const reservedRows = baseReservedRows + headingRows;

  return (
    <Box flexDirection="column">
      <Text>
        Channel: <Text bold>{selectedChannel}</Text>{" "}
        <Text color="gray">{currentStatusLabel}</Text>
      </Text>
      <Text>
        Select a new status (Enter). Type to filter. Backspace edits. Esc clears the
        filter, then reselects the channel.
      </Text>
      {filterValue ? <Text color="gray">{`Filter: “${filterValue}”`}</Text> : null}
      <Box marginTop={1} flexDirection="column">
        <Box flexDirection="row">
          <Box width={pointerColumnWidth} />
          <Box width={statusColumnWidth}>
            <Text bold wrap="truncate-end">
              Status
            </Text>
          </Box>
          <Box width={titleColumnWidth}>
            <Text bold wrap="truncate-end">
              Details
            </Text>
          </Box>
        </Box>
        <SelectableList<SocialState>
          items={items}
          isActive={isActive}
          onSelect={onSelect}
          itemKeyPrefix={`status-${selectedChannel}`}
          pointerColumnWidth={pointerColumnWidth}
          reservedRows={reservedRows}
          emptyPlaceholder={
            <Text color="yellow">
              No statuses match the filter. Adjust your search or press Esc to clear.
            </Text>
          }
          renderItem={(item, isSelected) => {
            const isCurrent = item.value === currentStatus?.status;
            return (
              <Box flexDirection="row">
                <Box width={statusColumnWidth}>
                  <HighlightedText
                    value={item.value}
                    tokens={tokens}
                    defaultColor={isSelected ? "cyan" : undefined}
                  />
                </Box>
                <Box width={titleColumnWidth}>
                  <Text color={isCurrent ? "green" : "gray"} wrap="truncate-end">
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
};
