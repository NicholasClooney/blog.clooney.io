const slugify = (value) =>
  encodeURIComponent(String(value).trim().toLowerCase().replace(/\s+/g, '-'));

export default {
  eleventyComputed: {
    projectsSorted(data) {
      const list = Array.isArray(data.projects) ? data.projects : [];
      const normalizeStatus = (status) =>
        typeof status === 'string' && status.trim().length
          ? status.trim().toLowerCase()
          : 'active';

      const parseDate = (value) => {
        if (!value) return null;
        const candidate = new Date(value);
        return Number.isNaN(candidate.valueOf()) ? null : candidate;
      };

      const clone = list.map((project) => {
        const status = normalizeStatus(project.status);
        const tech = Array.isArray(project.tech) ? project.tech : [];
        const tagDetails = tech.map((label) => ({
          label,
          slug: slugify(label),
        }));

        return {
          ...project,
          status,
          tech,
          tags: tagDetails,
          tagSlugs: tagDetails.map((tag) => tag.slug),
          lastUpdated: project.lastUpdated || null,
          lastUpdatedDate: parseDate(project.lastUpdated || null),
        };
      });

      clone.sort((a, b) => {
        const first = a.lastUpdatedDate
          ? a.lastUpdatedDate.getTime()
          : Number.NEGATIVE_INFINITY;
        const second = b.lastUpdatedDate
          ? b.lastUpdatedDate.getTime()
          : Number.NEGATIVE_INFINITY;
        return second - first;
      });

      return clone;
    },
    activeProjects(data) {
      return (data.projectsSorted || []).filter(
        (project) => project.status === 'active',
      );
    },
    archivedProjects(data) {
      return (data.projectsSorted || []).filter(
        (project) => project.status !== 'active',
      );
    },
    projectTags(data) {
      const counts = new Map();
      for (const project of data.projectsSorted || []) {
        for (const { label, slug } of project.tags || []) {
          const existing = counts.get(slug) || {
            label,
            slug,
            count: 0,
          };
          existing.count += 1;
          counts.set(slug, existing);
        }
      }

      return Array.from(counts.values()).sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }),
      );
    },
  },
};
