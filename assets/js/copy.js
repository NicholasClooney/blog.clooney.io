const computeCollapseHeight = (container) => {
  const threshold = Number.parseInt(container.dataset.collapseThreshold, 10);
  if (!Number.isFinite(threshold) || threshold <= 0) {
    return;
  }
  const pre = container.querySelector('.gh-embed__pre, .code-block__pre');
  if (!pre) {
    return;
  }

  const list = container.querySelector('.gh-embed__ol');
  let anchor = null;
  if (list) {
    const items = list.querySelectorAll(':scope > li');
    if (items.length === 0) {
      return;
    }
    const index = Math.min(items.length, threshold) - 1;
    anchor = items[index];
  } else {
    const code = pre.querySelector('code');
    if (!code) {
      return;
    }
    const computed = window.getComputedStyle(code);
    const lineHeight = Number.parseFloat(computed.lineHeight);
    if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
      return;
    }
    const verticalPadding =
      Number.parseFloat(window.getComputedStyle(pre).paddingTop || '0') +
      Number.parseFloat(window.getComputedStyle(pre).paddingBottom || '0');
    const height = lineHeight * threshold + verticalPadding;
    pre.style.setProperty('--gh-collapse-height', `${height}px`);
    return;
  }

  if (!anchor) {
    return;
  }
  const height = anchor.offsetTop + anchor.offsetHeight;
  pre.style.setProperty('--gh-collapse-height', `${height}px`);
};

const setupCollapsibleContent = () => {
  document
    .querySelectorAll('.gh-embed[data-collapse-threshold], .code-block[data-collapse-threshold]')
    .forEach((container) => {
      const threshold = Number.parseInt(
        container.dataset.collapseThreshold || '',
        10,
      );
      const lineCount = Number.parseInt(container.dataset.lineCount || '', 10);
      if (!Number.isFinite(threshold) || !Number.isFinite(lineCount)) {
        return;
      }
      if (lineCount <= threshold) {
        container.classList.remove(
          'gh-embed--collapsible',
          'gh-embed--collapsed',
          'code-block--collapsible',
          'code-block--collapsed',
        );
        const pre = container.querySelector('.gh-embed__pre, .code-block__pre');
        pre?.style.removeProperty('--gh-collapse-height');
        return;
      }
      if (container.dataset.collapseSetup === 'true') {
        computeCollapseHeight(container);
        return;
      }
      container.dataset.collapseSetup = 'true';
      computeCollapseHeight(container);
      const pre = container.querySelector('.gh-embed__pre, .code-block__pre');
      if (pre && 'ResizeObserver' in window) {
        const observer = new ResizeObserver(() => computeCollapseHeight(container));
        observer.observe(pre);
      }
    });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCollapsibleContent);
} else {
  setupCollapsibleContent();
}
window.addEventListener('load', setupCollapsibleContent);
window.addEventListener('resize', setupCollapsibleContent, { passive: true });

document.addEventListener('click', (event) => {
  const toggle = event.target.closest('[data-collapse-toggle]');
  if (toggle) {
    const container = toggle.closest(
      '.gh-embed--collapsible, .code-block--collapsible',
    );
    if (container) {
      const collapsed = container.classList.contains('gh-embed--collapsible')
        ? container.classList.toggle('gh-embed--collapsed')
        : container.classList.toggle('code-block--collapsed');
      const expandLabel = toggle.dataset.expandLabel || 'Expand';
      const collapseLabel = toggle.dataset.collapseLabel || 'Collapse';
      toggle.textContent = collapsed ? expandLabel : collapseLabel;
      toggle.setAttribute('aria-expanded', String(!collapsed));
      if (collapsed) {
        container
          .querySelector('.gh-embed__pre, .code-block__pre')
          ?.scrollTo({ top: 0 });
      } else {
        computeCollapseHeight(container);
      }
    }
    return;
  }

  const button = event.target.closest('[data-clipboard]');
  if (!button) return;
  const container = button.closest('.gh-embed, .code-block');
  if (!container) return;

  let text = '';
  if (container.classList.contains('gh-embed')) {
    const content = container.querySelectorAll('.gh-embed__ol > li > code');
    text = Array.from(content)
      .map((node) => node.textContent)
      .join('\n');
  } else {
    text = container.querySelector('pre code')?.textContent || '';
  }

  if (!text) return;
  void navigator.clipboard?.writeText(text);
  const original = button.textContent;
  button.textContent = 'Copied!';
  window.setTimeout(() => {
    button.textContent = original || 'Copy';
  }, 1200);
});
