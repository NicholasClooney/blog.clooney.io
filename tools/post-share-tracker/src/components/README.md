# src/components

Reusable Ink UI building blocks.

## ChannelActivityList.tsx
Renders relative activity summaries for each channel.
- Displays channel labels, colour-coded recency, and optional timestamps.
- Accepts precomputed summaries to keep rendering pure.

## HighlightedText.tsx
Text component with inline token highlighting.
- Splits the string into match and non-match segments.
- Applies configurable colours and bold styling to matched ranges.

## PostStatusTable.tsx
Table elements for showing per-channel status by post.
- `PostStatusHeader` renders the column heading row.
- `PostStatusRow` shows a post title and channel status cells.
- Uses `HighlightedText` to surface filter matches.

## SelectableList.tsx
Generic keyboard-navigable selection list.
- Tracks highlight state and responds to arrow/enter keys.
- Supports custom item rendering and empty placeholders.
- Provides pointer column width control for alignment.
