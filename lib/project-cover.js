// Stable hue (0-359) for a project's placeholder cover: FNV-1a over the name.
export const projectHue = (name) => {
  let hash = 2166136261;
  for (const char of String(name ?? '')) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash % 360;
};

// Address shown in the placeholder's window bar: the repo or site without its scheme.
export const projectAddress = (project = {}) => {
  const link = project.repo || project.url;
  if (!link) return project.name || '';
  return String(link).replace(/^[a-z]+:\/\//i, '').replace(/\/+$/, '');
};
