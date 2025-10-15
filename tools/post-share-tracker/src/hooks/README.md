# src/hooks

Shared React hooks for the tracker UI.

## useFilterTokens.ts
Memoises tokenised filter strings.
- Wraps `toFilterTokens` to avoid recomputation between renders.
- Keeps downstream selectors in sync with user input text.
