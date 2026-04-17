---
name: release
description: Cut a new versioned release for 11ty-subspace-builder. Use when the user says "create a release", "cut a release", or "release following convention".
---

Cut a new release for this repo following the established convention.

## Steps

1. **Determine the next version** using semver:
   - Patch (`x.x.N`) — bug fixes, copy changes, dependency bumps
   - Minor (`x.N.0`) — new features or visible additions (most common)
   - Major (`N.0.0`) — breaking changes

2. **Bump every repo-owned release version reference** to the new version.
   - Always update `package.json`
   - Always update the mirrored root version fields in `package-lock.json`
     - top-level `"version"`
     - `packages[""].version`
   - If more repo files mirror the release version in future, update those too

   Verify with a search for the old version before committing so you do not leave stale release numbers behind.

3. **Keep the implementation commit separate from the release commit.**
   - Feature, bug fix, refactor, and content changes should already be committed with their own intentional commit message before starting the release step.
   - The release commit should contain only the version bump and any repo-owned release metadata changes.

4. **Commit the version bump** on the current branch:
   ```
   chore: release vX.Y.Z
   ```

5. **Push** the commit.

6. **Create a GitHub release** via `gh release create`:
   - Tag: `vX.Y.Z`
   - Title: `11ty Subspace Builder: vX.Y.Z - <short feature name>`
   - Body: bullet points describing what changed (imperative, concise), followed by a compare URL:
     ```
     https://github.com/TheClooneyCollection/11ty-subspace-builder/compare/vPREV...vNEW
     ```

## Title convention

```
11ty Subspace Builder: v1.23.0 - Timeline time field
```

Short, sentence-case description of the headline change. No trailing period.

## Body convention

```
- Add X to Y.
- Update Z so that ...

https://github.com/TheClooneyCollection/11ty-subspace-builder/compare/v1.22.0...v1.23.0
```

Bullet points only. Each starts with a capital verb (Add, Update, Fix, Remove). No markdown headers. Compare link on its own line at the end.
