const computeCollapseHeight = (embed) => {
  const threshold = Number.parseInt(embed.dataset.collapseThreshold, 10);
  if (!Number.isFinite(threshold) || threshold <= 0) {
    return;
  }
  const list = embed.querySelector('.gh-embed__ol');
  const pre = embed.querySelector('.gh-embed__pre');
  if (!list || !pre) {
    return;
  }
  const items = list.querySelectorAll(':scope > li');
  if (items.length === 0) {
    return;
  }
  const index = Math.min(items.length, threshold) - 1;
  const anchor = items[index];
  if (!anchor) {
    return;
  }
  const height = anchor.offsetTop + anchor.offsetHeight;
  pre.style.setProperty('--gh-collapse-height', `${height}px`);
};

const setupCollapsibleEmbeds = () => {
  document
    .querySelectorAll('.gh-embed[data-collapse-threshold]')
    .forEach((embed) => {
      const threshold = Number.parseInt(
        embed.dataset.collapseThreshold || '',
        10,
      );
      const lineCount = Number.parseInt(embed.dataset.lineCount || '', 10);
      if (!Number.isFinite(threshold) || !Number.isFinite(lineCount)) {
        return;
      }
      if (lineCount <= threshold) {
        embed.classList.remove('gh-embed--collapsible', 'gh-embed--collapsed');
        const pre = embed.querySelector('.gh-embed__pre');
        pre?.style.removeProperty('--gh-collapse-height');
        return;
      }
      if (embed.dataset.collapseSetup === 'true') {
        computeCollapseHeight(embed);
        return;
      }
      embed.dataset.collapseSetup = 'true';
      computeCollapseHeight(embed);
      const pre = embed.querySelector('.gh-embed__pre');
      if (pre && 'ResizeObserver' in window) {
        const observer = new ResizeObserver(() => computeCollapseHeight(embed));
        observer.observe(pre);
      }
    });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCollapsibleEmbeds);
} else {
  setupCollapsibleEmbeds();
}
window.addEventListener('load', setupCollapsibleEmbeds);
window.addEventListener('resize', setupCollapsibleEmbeds, { passive: true });

document.addEventListener('click', (event) => {
  const toggle = event.target.closest('[data-collapse-toggle]');
  if (toggle) {
    const embed = toggle.closest('.gh-embed--collapsible');
    if (embed) {
      const collapsed = embed.classList.toggle('gh-embed--collapsed');
      const expandLabel = toggle.dataset.expandLabel || 'Expand';
      const collapseLabel = toggle.dataset.collapseLabel || 'Collapse';
      toggle.textContent = collapsed ? expandLabel : collapseLabel;
      toggle.setAttribute('aria-expanded', String(!collapsed));
      if (collapsed) {
        embed.querySelector('.gh-embed__pre')?.scrollTo({ top: 0 });
      } else {
        computeCollapseHeight(embed);
      }
    }
    return;
  }

  const button = event.target.closest('[data-clipboard]');
  if (!button) return;
  const embed = button.closest('.gh-embed');
  if (!embed) return;
  const content = embed.querySelectorAll('.gh-embed__ol > li > code');
  const text = Array.from(content)
    .map((node) => node.textContent)
    .join('\n');
  if (!text) return;
  void navigator.clipboard?.writeText(text);
  const original = button.textContent;
  button.textContent = 'Copied!';
  window.setTimeout(() => {
    button.textContent = original || 'Copy';
  }, 1200);
});
