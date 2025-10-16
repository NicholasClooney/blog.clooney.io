# src/app/views

View components that render each interactive state of the tracker.

## PostSelectionView.tsx
Lists posts and shows their channel statuses.
- Displays header labels and leverages `PostStatusRow` for each entry.
- Prepends row numbers based on the filtered ordering to make cross-referencing easier.
- Renders filter guidance and empty-state messaging.
- Invokes the supplied callback when a post is chosen.

## ChannelSelectionView.tsx
Lets the user choose a social channel for the current post.
- Presents channel name alongside formatted status details.
- Highlights token matches in both columns.
- Supplies descriptive empty-state messaging during filtering.

## StatusSelectionView.tsx
Allows picking a new status for a selected channel.
- Indicates the channel’s current status and filter instructions.
- Highlights selectable statuses and marks the already active one.
- Emits selection events while relaying empty-state hints.

## index.ts
Aggregates the view exports for convenient imports.
- Re-exports the three view components used by `App.tsx`.
