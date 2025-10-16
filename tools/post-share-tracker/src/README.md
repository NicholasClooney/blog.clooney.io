# src

Entry point and core services for the post share tracker CLI.

## index.tsx
GLUE component that renders the Ink app.
- Imports the top-level `App` and mounts it with `ink.render`.

## loadPosts.ts
Parses Markdown posts and extracts social metadata.
- Scans the posts directory with `globby`.
- Uses `gray-matter` to read front matter and normalise titles.
- Builds `PostMeta` records with per-channel status hydration.
- Captures each post’s creation timestamp (front matter date or file birth time) and sorts by newest first.

## savePostSocial.ts
Updates a post’s front matter with new social status information.
- Validates input parameters and supports auto timestamping.
- Reads, mutates, and optionally writes Markdown front matter.
- Preserves channel ordering while merging existing social data.

## filtering.ts
Normalises free-form search filters for fuzzy matching.
- Tokenises filter strings and trims empty values.
- Computes sequential match ranges for highlighting.
- Provides a boolean helper to test if text satisfies tokens.

## posts/display.ts
Helpers for rendering post labels in the UI.
- Builds channel status summaries for quick overviews.
- Produces the composite label shown in post pickers.

## config.ts
Public configuration facade used throughout the app.
- Loads YAML config once and caches the result.
- Re-exports derived constants and types for social channels.

## app
Ink application logic and per-screen views. See `app/README.md`.

## components
Reusable Ink components shared across views. See `components/README.md`.

## config
Configuration parsing utilities. See `config/README.md`.

## hooks
React hooks that encapsulate shared state logic. See `hooks/README.md`.

## social
Helpers for social status formatting and activity summaries. See `social/README.md`.

## utils
Low-level utilities used across modules. See `utils/README.md`.
