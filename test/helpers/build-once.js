import fs from 'node:fs';
import path from 'node:path';

const SITE_DIRS = {
  prod: path.resolve('_site'),
  dev: path.resolve('_site-dev'),
};

const getNormalizedMode = (mode = 'prod') => (mode === 'dev' ? 'dev' : 'prod');

// _site is built once by test/helpers/global-setup.js before any worker
// starts. This function exists for backward compatibility with test files
// that call it inside beforeAll; it is a no-op.
export const ensureSiteBuilt = async () => {};

export const getSiteDir = (mode = 'prod') => SITE_DIRS[getNormalizedMode(mode)];

export const readSiteFile = (relativePath, options = {}) => {
  const full = path.join(
    getSiteDir(options.mode),
    relativePath.replace(/^\/+/, ''),
  );
  return fs.readFileSync(full, 'utf8');
};

export const sitePathExists = (relativePath, options = {}) => {
  const full = path.join(
    getSiteDir(options.mode),
    relativePath.replace(/^\/+/, ''),
  );
  return fs.existsSync(full);
};

export const readSitePage = (urlPath, options = {}) => {
  const trimmed = urlPath.replace(/^\/+/, '').replace(/\/+$/, '');
  const candidate = trimmed === '' ? 'index.html' : `${trimmed}/index.html`;
  return readSiteFile(candidate, options);
};

export const walkSiteHtml = function* (subdir = '', options = {}) {
  const siteDir = getSiteDir(options.mode);
  const start = path.join(siteDir, subdir);
  if (!fs.existsSync(start)) return;
  const stack = [start];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        yield {
          absolutePath: full,
          relativePath: path.relative(siteDir, full),
        };
      }
    }
  }
};
