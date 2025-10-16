# src/social

Social-status formatting and analytics helpers.

## channelActivity.ts
Aggregates relative activity information per channel.
- Scans posts to find latest shared timestamps.
- Handles invalid dates and “never shared” cases.
- Assigns recency colours using configured bands.

## statusDisplay.ts
Formats individual social status records for display.
- Determines text colour based on status value.
- Builds compact relative-time labels (e.g., `shared (2d)`) while handling invalid dates gracefully.
