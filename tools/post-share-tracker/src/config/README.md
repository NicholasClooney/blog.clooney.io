# src/config

Utilities for loading and validating tracker configuration.

## duration.ts
Converts human-friendly durations into milliseconds.
- Defines canonical unit aliases (minute, hour, etc.).
- Validates magnitude and unit syntax before returning ms.

## paths.ts
Resolves file system paths relative to the project root.
- Exposes `projectRoot` for shared use.
- Provides the `configPath` to `config.yaml`.

## types.ts
Shared TypeScript shapes for configuration data.
- Declares `TrackerConfig` and `ChannelActivityRecencyBand`.

## validation.ts
Guards config data integrity.
- Ensures social channel/state arrays are non-empty and unique.
- Validates recency band objects and max-age ordering with duration parsing.
