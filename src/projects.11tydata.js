const slugify = (value) =>
  encodeURIComponent(String(value).trim().toLowerCase().replace(/\s+/g, '-'));

const mapProjects = (items) => {
  const list = Array.isArray(items) ? items : [];

  return list
    .filter((project) => project && typeof project === 'object')
    .map((project) => {
      const tech = Array.isArray(project.tech) ? project.tech : [];
      const tagDetails = tech.map((label) => ({
        label,
        slug: slugify(label),
      }));

      return {
        ...project,
        tech,
        tags: tagDetails,
        tagSlugs: tagDetails.map((tag) => tag.slug),
      };
    });
};

export default {
  eleventyComputed: {
    projectCollections(data) {
      const source = data.projects && typeof data.projects === 'object'
        ? data.projects
        : {};

      return {
        active: mapProjects(source.active),
        archive: mapProjects(source.archive ?? source.archived),
      };
    },
    activeProjects(data) {
      return (data.projectCollections && data.projectCollections.active) || [];
    },
    archivedProjects(data) {
      return (
        (data.projectCollections && data.projectCollections.archive) || []
      );
    },
    projectTags(data) {
      const counts = new Map();
      const collections = data.projectCollections || { active: [], archive: [] };

      for (const project of [
        ...(collections.active || []),
        ...(collections.archive || []),
      ]) {
        for (const { label, slug } of project.tags || []) {
          const existing = counts.get(slug) || { label, slug, count: 0 };
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
