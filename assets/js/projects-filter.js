(() => {
  const root = document.querySelector('[data-projects]');
  if (!root) return;

  const cards = Array.from(root.querySelectorAll('[data-project-card]'));
  const sections = Array.from(root.querySelectorAll('[data-project-section]'));
  const globalEmpty = root.querySelector('[data-projects-empty]');
  const resetButtons = Array.from(
    root.querySelectorAll('[data-project-filter-reset]'),
  );
  const tagButtons = Array.from(root.querySelectorAll('[data-project-filter]'));

  if (!cards.length) return;

  const validTags = new Set(
    tagButtons.map((button) => button.dataset.projectFilter).filter(Boolean),
  );
  const paramKey = 'tag';

  const getCardTags = (card) => {
    const { tags = '' } = card.dataset;
    return tags
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  };

  const updateURL = (tag) => {
    const params = new URLSearchParams(window.location.search);
    if (tag) {
      params.set(paramKey, tag);
    } else {
      params.delete(paramKey);
    }

    const query = params.toString();
    const { pathname, hash } = window.location;
    const newUrl = `${pathname}${query ? `?${query}` : ''}${hash || ''}`;
    window.history.replaceState({}, '', newUrl);
  };

  const updateButtons = (tag) => {
    const activeTag = tag || null;
    const isFiltering = Boolean(activeTag);

    resetButtons.forEach((button) => {
      button.setAttribute('aria-pressed', isFiltering ? 'false' : 'true');
      button.dataset.active = isFiltering ? 'false' : 'true';
    });

    tagButtons.forEach((button) => {
      const buttonTag = button.dataset.projectFilter;
      const isActive = isFiltering && buttonTag === activeTag;
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      button.dataset.active = isActive ? 'true' : 'false';
    });
  };

  const updateSections = () => {
    let anyVisible = false;

    sections.forEach((section) => {
      const list = section.querySelector('[data-project-list]');
      const sectionCards = list
        ? Array.from(list.querySelectorAll('[data-project-card]'))
        : [];
      const hasVisible = sectionCards.some(
        (card) => !card.hasAttribute('hidden'),
      );
      anyVisible = anyVisible || hasVisible;

      if (list) {
        list.classList.toggle('dn', !hasVisible);
      }

      const empty = section.querySelector('[data-project-section-empty]');
      if (empty) {
        empty.setAttribute('data-visible', hasVisible ? 'false' : 'true');
        empty.classList.toggle('dn', hasVisible);
      }
    });

    if (globalEmpty) {
      globalEmpty.setAttribute('data-visible', anyVisible ? 'false' : 'true');
      globalEmpty.classList.toggle('dn', anyVisible);
    }
  };

  const applyFilter = (tag) => {
    const activeTag = tag || null;

    cards.forEach((card) => {
      const tags = getCardTags(card);
      const shouldShow = !activeTag || tags.includes(activeTag);

      if (shouldShow) {
        card.removeAttribute('hidden');
      } else {
        card.setAttribute('hidden', 'hidden');
      }
    });

    updateButtons(activeTag);
    updateSections();
    updateURL(activeTag);
  };

  const handleTagClick = (event) => {
    event.preventDefault();
    const target = event.currentTarget;
    const tag = target.dataset.projectFilter;
    if (!tag) return;

    const isActive = target.getAttribute('aria-pressed') === 'true';
    applyFilter(isActive ? null : tag);
  };

  const handleResetClick = (event) => {
    event.preventDefault();
    applyFilter(null);
  };

  tagButtons.forEach((button) => {
    button.addEventListener('click', handleTagClick);
  });

  resetButtons.forEach((button) => {
    button.addEventListener('click', handleResetClick);
  });

  // Initialize from URL param
  const params = new URLSearchParams(window.location.search);
  const initial = params.get(paramKey);
  if (initial && validTags.has(initial)) {
    applyFilter(initial);
  } else {
    applyFilter(null);
  }
})();
