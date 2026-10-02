import { describe, expect, it } from 'vitest';
import {
  computeContentSeries,
  resolveSeriesDefaultSort,
  sortSeriesEntries,
} from '../../lib/series.js';

const entries = [
  { url: '/posts/first/', data: { date: '2026-10-01' } },
  { url: '/posts/evening/', data: { date: '2026-10-02', time: '19:25' } },
  { url: '/posts/morning/', data: { date: '2026-10-02', time: '10:15' } },
  { url: '/posts/untimed/', data: { date: '2026-10-02' } },
];

const urlsFor = (sort) =>
  sortSeriesEntries(entries, sort).map(({ entry }) => entry.url);

describe('resolveSeriesDefaultSort', () => {
  it('defaults to curated', () => {
    expect(resolveSeriesDefaultSort({}, {})).toEqual({
      sort: 'curated',
      invalid: [],
    });
  });

  it('uses the site default', () => {
    expect(
      resolveSeriesDefaultSort({}, { series: { defaultSort: 'date-desc' } }).sort,
    ).toBe('date-desc');
  });

  it('prefers the per-series override', () => {
    expect(
      resolveSeriesDefaultSort(
        { defaultSort: 'reverse' },
        { series: { defaultSort: 'date-desc' } },
      ).sort,
    ).toBe('reverse');
  });

  it('reports invalid values and falls through', () => {
    const result = resolveSeriesDefaultSort(
      { id: 'demo', defaultSort: 'newest' },
      { series: { defaultSort: 'date-desc' } },
    );
    expect(result.sort).toBe('date-desc');
    expect(result.invalid).toEqual(['series "demo" defaultSort "newest"']);
  });
});

describe('sortSeriesEntries', () => {
  it('keeps declared order for curated', () => {
    expect(urlsFor('curated')).toEqual([
      '/posts/first/',
      '/posts/evening/',
      '/posts/morning/',
      '/posts/untimed/',
    ]);
  });

  it('reverses declared order', () => {
    expect(urlsFor('reverse')).toEqual([
      '/posts/untimed/',
      '/posts/morning/',
      '/posts/evening/',
      '/posts/first/',
    ]);
  });

  it('orders same-day entries by time, treating missing time as midnight', () => {
    expect(urlsFor('date-asc')).toEqual([
      '/posts/first/',
      '/posts/untimed/',
      '/posts/morning/',
      '/posts/evening/',
    ]);
    expect(urlsFor('date-desc')).toEqual([
      '/posts/evening/',
      '/posts/morning/',
      '/posts/untimed/',
      '/posts/first/',
    ]);
  });

  it('keeps each entry curated index for its declared position', () => {
    const [newest] = sortSeriesEntries(entries, 'date-desc');
    expect(newest.curatedIndex).toBe(1);
  });

  it('does not change content page positions', () => {
    const series = [
      {
        id: 'demo',
        defaultSort: 'date-desc',
        entries: entries.map((entry) => entry.url),
      },
    ];
    const [membership] = computeContentSeries({
      page: { url: '/posts/untimed/' },
      series,
    });
    expect(membership.position).toBe(4);
    expect(membership.total).toBe(4);
  });
});
