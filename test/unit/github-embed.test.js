import { describe, it, expect } from 'vitest';
import {
  parseBlobUrl,
  parseGistUrl,
  parseGithubUrl,
  trimSharedIndent,
  guessLanguageByExt,
} from '../../lib/markdown/github-embed.js';

describe('parseBlobUrl', () => {
  it('parses a plain blob URL with no line range', () => {
    const r = parseBlobUrl('https://github.com/u/r/blob/main/src/a.js');
    expect(r.user).toBe('u');
    expect(r.repo).toBe('r');
    expect(r.branch).toBe('main');
    expect(r.filePath).toBe('src/a.js');
    expect(r.raw).toBe('https://raw.githubusercontent.com/u/r/main/src/a.js');
    expect(r.start).toBe(null);
    expect(r.end).toBe(null);
  });

  it('parses a single-line range #L10', () => {
    const r = parseBlobUrl('https://github.com/u/r/blob/main/a.js#L10');
    expect(r.start).toBe(10);
    expect(r.end).toBe(10);
  });

  it('parses a range #L10-L20', () => {
    const r = parseBlobUrl('https://github.com/u/r/blob/main/a.js#L10-L20');
    expect(r.start).toBe(10);
    expect(r.end).toBe(20);
  });

  it('throws for a non-blob URL', () => {
    expect(() =>
      parseBlobUrl('https://github.com/u/r/tree/main/src'),
    ).toThrow(/blob URL/);
  });

  it('joins nested file paths', () => {
    const r = parseBlobUrl('https://github.com/u/r/blob/main/a/b/c.js');
    expect(r.filePath).toBe('a/b/c.js');
  });
});

describe('parseGistUrl', () => {
  it('parses a gist URL without a revision', () => {
    const r = parseGistUrl('https://gist.github.com/u/abc123?file=a.js');
    expect(r.user).toBe('u');
    expect(r.repo).toBe('abc123');
    expect(r.branch).toBe('abc123');
    expect(r.filePath).toBe('a.js');
    expect(r.raw).toBe('https://gist.githubusercontent.com/u/abc123/raw/a.js');
    expect(r.start).toBe(null);
    expect(r.end).toBe(null);
  });

  it('pins to a revision SHA when present', () => {
    const r = parseGistUrl('https://gist.github.com/u/abc123/deadbeef?file=a.js');
    expect(r.branch).toBe('deadbeef');
    expect(r.raw).toBe(
      'https://gist.githubusercontent.com/u/abc123/raw/deadbeef/a.js',
    );
  });

  it('parses a line range #L10-L20', () => {
    const r = parseGistUrl(
      'https://gist.github.com/u/abc123?file=a.js#L10-L20',
    );
    expect(r.start).toBe(10);
    expect(r.end).toBe(20);
  });

  it('throws when the ?file= param is missing', () => {
    expect(() => parseGistUrl('https://gist.github.com/u/abc123')).toThrow(
      /file=/,
    );
  });

  it('throws when the URL is missing user or gist id', () => {
    expect(() => parseGistUrl('https://gist.github.com/u?file=a.js')).toThrow(
      /gist URL/,
    );
  });
});

describe('parseGithubUrl', () => {
  it('routes blob URLs to parseBlobUrl', () => {
    const r = parseGithubUrl('https://github.com/u/r/blob/main/a.js');
    expect(r.raw).toBe('https://raw.githubusercontent.com/u/r/main/a.js');
  });

  it('routes gist URLs to parseGistUrl', () => {
    const r = parseGithubUrl('https://gist.github.com/u/abc123?file=a.js');
    expect(r.raw).toBe('https://gist.githubusercontent.com/u/abc123/raw/a.js');
  });
});

describe('trimSharedIndent', () => {
  it('removes the shared indent from every non-blank line', () => {
    const input = '    one\n    two\n    three';
    expect(trimSharedIndent(input)).toBe('one\ntwo\nthree');
  });

  it('preserves blank lines as empty', () => {
    const input = '  one\n\n  two';
    expect(trimSharedIndent(input)).toBe('one\n\ntwo');
  });

  it('returns input unchanged when min indent is 0', () => {
    expect(trimSharedIndent('top\n  nested')).toBe('top\n  nested');
  });

  it('handles mixed indent depths by taking the minimum', () => {
    const input = '  shallow\n    deeper\n  shallow';
    expect(trimSharedIndent(input)).toBe('shallow\n  deeper\nshallow');
  });

  it('handles empty and non-string input', () => {
    expect(trimSharedIndent('')).toBe('');
    expect(trimSharedIndent(null)).toBe(null);
  });
});

describe('guessLanguageByExt', () => {
  it('maps common extensions to highlight.js names', () => {
    expect(guessLanguageByExt('a.js')).toBe('javascript');
    expect(guessLanguageByExt('a.ts')).toBe('typescript');
    expect(guessLanguageByExt('a.yaml')).toBe('yaml');
    expect(guessLanguageByExt('a.html')).toBe('xml');
    expect(guessLanguageByExt('a.md')).toBe('markdown');
  });

  it('is case-insensitive on the extension', () => {
    expect(guessLanguageByExt('A.JS')).toBe('javascript');
  });

  it('falls back to plaintext for unknown extensions', () => {
    expect(guessLanguageByExt('a.unknown')).toBe('plaintext');
    expect(guessLanguageByExt('Makefile')).toBe('plaintext');
  });
});
