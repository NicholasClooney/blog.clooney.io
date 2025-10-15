# Repository Guidelines

## Project Structure & Module Organization
- CLI source lives in `src/` with feature-based subfolders (`app`, `components`, `config`, `social`, etc.); each folder has a README for quick orientation—update these docs when touching corresponding code.
- Tests reside in `tests/` and mirror the structure of the modules they cover.
- Configuration files sit at the repo root (`config.yaml`, `vitest.config.ts`, `tsconfig.json`), while compiled artifacts land in `dist/`.
- Posts consumed by the tracker are expected under `../posts/` relative to this tool.

## Build, Test, and Development Commands
- `npm install` — install dependencies; run once after cloning or when package.json changes.
- `npm run build` — compile the Ink app to `dist/` for distribution.
- `npm start` — launch the tracker CLI in development mode via `tsx`.
- `npm run test` — execute the Vitest suite in watchless mode; use before every PR.

## Coding Style & Naming Conventions
- TypeScript and TSX files use 2-space indentation and prefer named exports for shared utilities.
- React/Ink components live in `.tsx` files; hook files start with `use`, and helper modules use lowerCamelCase filenames.
- Aim for descriptive variable names and small, cohesive modules; extract shared logic into `components/`, `hooks/`, or `utils/`.
- Run Prettier/ESLint via your editor; no repo-defined script exists yet, so keep formatting consistent with existing files.

## Testing Guidelines
- Vitest drives unit coverage; tests live in `tests/*.test.ts`.
- Match filenames to the module under test (e.g., `loadPosts.ts` → `tests/loadPosts.test.ts`).
- Ensure new logic has deterministic tests; mock filesystem interactions when needed.
- Always run `npm run test` locally before submitting changes.

## Commit & Pull Request Guidelines
- Use concise, imperative commit messages (e.g., “Refactor status views”); group related changes in a single commit where reasonable.
- Pull requests should describe the change, include screenshots when UI output differs, and link to relevant issues or tasks.
- Confirm CI/test results and highlight any remaining TODOs or follow-ups in the PR description.

## Documentation Expectations
- Update folder-level READMEs when features move or responsibilities change.
- When adding new modules, include a brief section in the relevant README (or create one) outlining purpose and key behaviours.
- If a README becomes outdated after your work, revise it in the same PR to avoid confusing future contributors.
