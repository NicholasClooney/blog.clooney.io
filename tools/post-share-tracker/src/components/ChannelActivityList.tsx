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
);
