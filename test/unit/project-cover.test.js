import { describe, it, expect } from 'vitest';
import { projectHue, projectAddress } from '../../lib/project-cover.js';

describe('projectHue', () => {
  it('is stable for the same name', () => {
    expect(projectHue('skills')).toBe(projectHue('skills'));
  });

  it('stays within 0-359', () => {
    for (const name of ['skills', 'Project Resume', '', 'ü 项目']) {
      const hue = projectHue(name);
      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThan(360);
    }
  });

  it('differs between names', () => {
    expect(projectHue('skills')).not.toBe(projectHue('Project Resume'));
  });
});

describe('projectAddress', () => {
  it('prefers the repo without its scheme', () => {
    expect(
      projectAddress({ repo: 'https://github.com/org/repo/', url: 'https://x.io' }),
    ).toBe('github.com/org/repo');
  });

  it('falls back to the url, then the name', () => {
    expect(projectAddress({ url: 'https://x.io' })).toBe('x.io');
    expect(projectAddress({ name: 'Joy' })).toBe('Joy');
  });
});
