import { describe, expect, it } from 'vitest';
import {
  formatSelectionHelp,
  parseSelectionInput,
} from '../../lib/starter-reset/options.js';

const items = [
  { id: 'posts', label: 'Posts' },
  { id: 'notes', label: 'Notes' },
  { id: 'timeline', label: 'Timeline' },
];

describe('parseSelectionInput', () => {
  it('accepts all', () => {
    expect(parseSelectionInput('all', items)).toEqual({
      mode: 'all',
      selected: items,
    });
  });

  it('accepts skip', () => {
    expect(parseSelectionInput('skip', items)).toEqual({
      mode: 'skip',
      selected: [],
    });
  });

  it('accepts mixed numeric selections', () => {
    expect(parseSelectionInput('1 3', items)).toEqual({
      mode: 'mixed',
      selected: [items[0], items[2]],
    });
  });

  it('deduplicates repeated numbers', () => {
    expect(parseSelectionInput('2 2 1', items)).toEqual({
      mode: 'mixed',
      selected: [items[1], items[0]],
    });
  });

  it('returns a helpful error for unknown tokens', () => {
    expect(parseSelectionInput('1 nope', items).error).toMatch(/Unknown option/);
  });

  it('returns a helpful error for out-of-range selections', () => {
    expect(parseSelectionInput('4', items).error).toMatch(/out of range/);
  });
});

describe('formatSelectionHelp', () => {
  it('describes the selection syntax', () => {
    expect(formatSelectionHelp(3)).toContain('1 3');
  });
});
