# src/utils

Low-level helpers used across features.

## time.ts
Parses timestamps and formats relative time strings.
- Converts raw values to `Date` objects with validation.
- Produces “x minutes ago” style labels with future support.

## terminalLayout.ts
Terminal-friendly layout helpers.
- Estimates how many wrapped rows a string consumes for a given width.
- Helps screens reserve enough vertical space when the terminal resizes.
