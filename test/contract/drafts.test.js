import { describe, it, expect, beforeAll } from 'vitest';
import {
  ensureSiteBuilt,
  sitePathExists,
} from '../helpers/build-once.js';
import { parsePage, selectAll, textOf } from '../helpers/parse.js';

const DEV_MODE = { mode: 'dev' };

describe('contract — /drafts/', () => {
  beforeAll(async () => {
    await ensureSiteBuilt();
  });

  it('drafts page is built at /drafts/', () => {
    expect(sitePathExists('drafts/index.html', DEV_MODE)).toBe(true);
  });

  it('renders the page heading without unresolved template syntax', () => {
    const { document } = parsePage('/drafts/', DEV_MODE);
    const h1 = document.querySelector('h1');
    expect(h1).toBeTruthy();
    expect(textOf(h1).length).toBeGreaterThan(0);
    expect(document.body.innerHTML).not.toMatch(/\{\{[^}]*\}\}/);
  });

  it('lists draft fixtures in the dev build', () => {
    const { document } = parsePage('/drafts/', DEV_MODE);
    const hrefs = selectAll(document, 'article a[href]').map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toContain('/posts/testing-post-order-evening/');
    expect(hrefs).toContain('/posts/testing-post-order-morning/');
    expect(hrefs).toContain('/notes/testing-note-order-evening/');
    expect(hrefs).toContain('/notes/testing-note-order-morning/');
  });
});
