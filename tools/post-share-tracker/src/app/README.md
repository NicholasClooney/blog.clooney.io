# src/app

Top-level Ink application state and screen orchestration.

## App.tsx
Manages data loading, user input, and mode switching.
- Loads posts and configures filters, selections, and status messages.
- Handles keyboard navigation and filter text input.
- Delegates rendering to the three mode-specific views.
- Triggers `savePostSocial` updates and refreshes data on completion.

## views
Mode-specific UI components. See `views/README.md`.
