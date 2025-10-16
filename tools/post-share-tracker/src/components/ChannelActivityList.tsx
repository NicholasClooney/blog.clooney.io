import React from "react";
import { Box, Text } from "ink";
import type { ChannelActivitySummary } from "../social/channelActivity.js";

export interface ChannelActivityListProps {
  summaries: ChannelActivitySummary[];
  statusColumnWidth: number;
}

export const ChannelActivityList: React.FC<ChannelActivityListProps> = ({
  summaries,
  statusColumnWidth,
}) => (
  <Box flexDirection="column">
    {summaries.map((summary) => (
      <Box key={summary.channel} flexDirection="row">
        <Box width={statusColumnWidth}>
          <Text bold wrap="truncate-end">
            {summary.channel}
          </Text>
        </Box>
        <Box flexDirection="row">
          <Text color={summary.color} wrap="truncate-end">
            {summary.display}
          </Text>
          {summary.exactTimestamp ? (
            <Text color="gray" wrap="truncate-end">
              {" "}
              ({summary.exactTimestamp})
            </Text>
          ) : null}
        </Box>
      </Box>
    ))}
  </Box>
);
