import { beforeAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import {
  ensureSiteBuilt,
  sitePathExists,
} from '../helpers/build-once.js';
import { parsePage, selectAll, textOf } from '../helpers/parse.js';

const loadSeries = () =>
  yaml.load(fs.readFileSync(path.resolve('_data/series.yaml'), 'utf8'));
const DEV_MODE = { mode: 'dev' };

describe('/series/', () => {
  let indexDoc;
  let series;
  let mixedSeries;

  beforeAll(async () => {
    await ensureSiteBuilt();
    ({ document: indexDoc } = parsePage('/series/'));
    series = loadSeries();
    mixedSeries = series.find((item) => item.id === 'subspace-surfaces');
  });

  it('renders one card per declared series', () => {
    const visibleSeries = series.filter((item) => !item.devOnly);
    const heads = selectAll(indexDoc, 'a[href^="/series/"]').filter(
      (a) =>
        /^\/series\/[^/]+\/$/.test(a.getAttribute('href') || '') &&
        textOf(a).length > 0,
    );
    const uniqueHrefs = new Set(heads.map((a) => a.getAttribute('href')));
    expect(uniqueHrefs.size).toBeGreaterThanOrEqual(visibleSeries.length);
    for (const s of visibleSeries) {
      expect(uniqueHrefs.has(`/series/${s.id}/`)).toBe(true);
    }
    expect(uniqueHrefs.has('/series/subspace-surfaces/')).toBe(false);
  });

  describe('a series page', () => {
    let seriesDoc;
    let seriesDef;

    beforeAll(() => {
      seriesDef = mixedSeries;
      ({ document: seriesDoc } = parsePage(`/series/${seriesDef.id}/`, DEV_MODE));
    });

    it('has a non-empty title matching the series definition', () => {
      const h1 = seriesDoc.querySelector('h1');
      expect(h1).toBeTruthy();
      expect(textOf(h1)).toContain(seriesDef.title);
    });

    const renderedEntries = (doc) =>
      selectAll(doc, '[data-series-entry]').map((item) => ({
        href: item.querySelector('h2 a')?.getAttribute('href'),
        value: item.getAttribute('value'),
      }));

    const pressedSort = (doc) =>
      selectAll(doc, '[data-series-sort][aria-pressed="true"]').map((button) =>
        button.getAttribute('data-series-sort'),
      );

    it('renders entries in its defaultSort order without JS', () => {
      expect(seriesDef.defaultSort).toBe('date-desc');
      expect(seriesDoc.querySelector('[data-series-page]')?.getAttribute(
        'data-series-default-sort',
      )).toBe('date-desc');
      expect(pressedSort(seriesDoc)).toEqual(['date-desc']);
      expect(renderedEntries(seriesDoc).map(({ href }) => href)).toEqual([
        '/timeline/2026-04-14-shipped-timeline/',
        '/posts/v1.13-1.20-roundup/',
        '/notes/testing-the-notes-collection/',
      ]);
    });

    it('keeps declared positions as list numbers when re-sorted', () => {
      const positions = Object.fromEntries(
        renderedEntries(seriesDoc).map(({ href, value }) => [href, value]),
      );
      seriesDef.entries.forEach((href, index) => {
        expect(positions[href]).toBe(String(index + 1));
      });
    });

    it('defaults other series to curated declared order', () => {
      const curatedDef = series.find((item) => item.id === 'subspace-builder');
      const { document } = parsePage(`/series/${curatedDef.id}/`);
      expect(pressedSort(document)).toEqual(['curated']);
      expect(renderedEntries(document).map(({ href }) => href)).toEqual(
        curatedDef.entries,
      );
    });

    it('includes front matter time in the date sort key', () => {
      const dates = Object.fromEntries(
        selectAll(seriesDoc, '[data-series-entry]').map((item) => [
          item.querySelector('h2 a')?.getAttribute('href'),
          item.getAttribute('data-date'),
        ]),
      );
      expect(dates['/timeline/2026-04-14-shipped-timeline/']).toBe('2026-04-14T15:42');
      expect(dates['/notes/testing-the-notes-collection/']).toBe('2026-04-12T00:00');
    });

    it('renders mixed-content entries on the generalized series page', () => {
      const hrefs = new Set(
        selectAll(seriesDoc, 'a[href]').map((a) => a.getAttribute('href')),
      );
      for (const href of seriesDef.entries) {
        expect(hrefs.has(href)).toBe(true);
      }
    });
  });

  describe('series backlinks', () => {
    it('renders the series membership box on a post detail page in dev', () => {
      const { document } = parsePage('/posts/v1.13-1.20-roundup/', DEV_MODE);
      const text = document.body?.textContent || '';
      expect(text).toContain('Part of a series');
      expect(text).toContain('Subspace Surfaces');
    });

    it('renders the series membership box on a note detail page in dev', () => {
      const { document } = parsePage('/notes/testing-the-notes-collection/', DEV_MODE);
      const text = document.body?.textContent || '';
      expect(text).toContain('Part of a series');
      expect(text).toContain('Subspace Surfaces');
    });

    it('renders the series membership box on a timeline detail page in dev', () => {
      const { document } = parsePage('/timeline/2026-04-14-shipped-timeline/', DEV_MODE);
      const text = document.body?.textContent || '';
      expect(text).toContain('Part of a series');
      expect(text).toContain('Subspace Surfaces');
    });

    it('does not emit the dev-only series page in production', () => {
      expect(sitePathExists('/series/subspace-surfaces/')).toBe(false);
    });
  });
});
