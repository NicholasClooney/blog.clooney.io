const TOKEN_SPLIT_PATTERN = /[\s,]+/;

export const parseSelectionInput = (input, items) => {
  const normalizedItems = Array.isArray(items) ? items : [];
  const raw = String(input || '').trim().toLowerCase();

  if (!normalizedItems.length) {
    return { mode: 'empty', selected: [] };
  }

  if (!raw) {
    return {
      error: `Enter ${formatSelectionHelp(normalizedItems.length)}.`,
    };
  }

  if (raw === 'all') {
    return { mode: 'all', selected: [...normalizedItems] };
  }

  if (raw === 'skip' || raw === 'none') {
    return { mode: 'skip', selected: [] };
  }

  const tokens = raw.split(TOKEN_SPLIT_PATTERN).filter(Boolean);
  const seen = new Set();
  const selected = [];

  for (const token of tokens) {
    const index = Number.parseInt(token, 10);

    if (!Number.isInteger(index)) {
      return { error: `Unknown option "${token}". Use ${formatSelectionHelp(normalizedItems.length)}.` };
    }

    if (index < 1 || index > normalizedItems.length) {
      return {
        error: `Option "${token}" is out of range. Use ${formatSelectionHelp(normalizedItems.length)}.`,
      };
    }

    if (seen.has(index)) continue;
    seen.add(index);
    selected.push(normalizedItems[index - 1]);
  }

  return { mode: 'mixed', selected };
};

export const formatSelectionHelp = (itemCount) =>
  itemCount > 1 ? '`all`, `skip`, or numbers like `1 3`' : '`all` or `skip`';
