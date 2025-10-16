import React, { useMemo } from "react";
import { Text } from "ink";
import { findSequentialTokenRanges } from "../filtering.js";

export interface HighlightedTextProps {
  value: string;
  tokens: string[];
  defaultColor?: string;
  defaultBold?: boolean;
  highlightColor?: string;
  wrap?: "wrap" | "truncate" | "truncate-start" | "truncate-middle" | "truncate-end";
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  value,
  tokens,
  defaultColor,
  defaultBold = false,
  highlightColor = "yellow",
  wrap = "truncate-end",
}) => {
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
    <Text color={defaultColor} bold={defaultBold} wrap={wrap}>
      {segments.map((segment, index) =>
        segment.isMatch ? (
          <Text key={`match-${index}`} color={highlightColor} bold wrap={wrap}>
            {segment.text}
          </Text>
        ) : (
          <React.Fragment key={`segment-${index}`}>{segment.text}</React.Fragment>
        )
      )}
    </Text>
  );
};
