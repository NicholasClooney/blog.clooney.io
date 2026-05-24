import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const SITE_DIRS = [
  path.resolve('_site'),
  path.resolve('_site-dev'),
];

const runEleventyBuild = ({ outputDir, environment }) => {
  const result = spawnSync(
    'npx',
    ['@11ty/eleventy', `--output=${outputDir}`],
    {
      env: { ...process.env, ELEVENTY_ENV: environment },
      stdio: 'inherit',
    },
  );

  if (result.status !== 0) {
    throw new Error(
      `Eleventy ${environment} build failed with exit code ${result.status}`,
    );
  }
};

export default function setup() {
  if (process.env.VITEST_SKIP_BUILD === '1') return;

  for (const siteDir of SITE_DIRS) {
    fs.rmSync(siteDir, { recursive: true, force: true });
  }

  runEleventyBuild({ outputDir: '_site', environment: 'production' });
  runEleventyBuild({ outputDir: '_site-dev', environment: 'development' });
}
