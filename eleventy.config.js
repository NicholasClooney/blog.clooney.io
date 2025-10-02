// 11ty Nav
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
// 11ty Img
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

// Bake our own Markdown anchors
import MarkdownIt from "markdown-it";
import MarkdownItAnchor from "markdown-it-anchor";
import MarkdownItTocDoneRight from "markdown-it-toc-done-right";
// Use yaml for data
import yaml from "js-yaml";
import excerpt from "./lib/excerpt.js";

const OG_FORCE_ENV = process.env.OG_FORCE === "true";

const slugify = (value) =>
	encodeURIComponent(String(value).trim().toLowerCase().replace(/\s+/g, "-"));

const md = new MarkdownIt({ html: true, linkify: true })
.use(MarkdownItAnchor, {
	slugify,
	permalink: MarkdownItAnchor.permalink.ariaHidden({
		class: "header-anchor",
		placement: "before",
	}),
})
.use(MarkdownItTocDoneRight, {
	containerClass: "toc",
	listType: "ul",
	level: [2, 3],
	slugify,
});

export default function (eleventyConfig) {
	const shouldSkipHref = (href) => {
		if (!href) return true;
		const value = href.trim();
		if (!value) return true;
		if (value.startsWith("#")) return true;
		if (value.startsWith("mailto:")) return true;
		if (value.startsWith("tel:")) return true;
		if (value.startsWith("javascript:")) return true;
		if (value.startsWith("data:")) return true;
		if (value.startsWith("//")) return true;
		if (value.startsWith("http://")) return true;
		if (value.startsWith("https://")) return true;
		return false;
	};

	const hasFileExtension = (path) => {
		if (!path) return false;
		const segment = path.split("/").pop();
		if (!segment) return false;
		return segment.includes(".");
	};

	const normalizePath = (path) => {
		if (!path) return path;
		if (path !== "/" && path.endsWith("/")) return path.slice(0, -1);
		return path;
	};

	eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));

	eleventyConfig.addGlobalData("eleventyComputed", {
		eleventyExcludeFromCollections(data) {
			return data.draft && process.env.ELEVENTY_ENV === "production";
		},
	});

	eleventyConfig.addGlobalData("environment", process.env.ELEVENTY_ENV || "development");

	eleventyConfig.addPlugin(eleventyNavigationPlugin);
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		formats: ["avif", "webp", "jpeg"],
		widths: [320, 640, 960, 1280],
		htmlOptions: {
			imgAttributes: {
				loading: "lazy",
				decoding: "async",
				sizes: "(width <= 30em) 100vw, 75vw",
			},
			pictureAttributes: {},
		},
	});

	// Tell 11ty to use our custom Markdown-it
	eleventyConfig.setLibrary("md", md);

	// Copy static assets straight through to the build output
	eleventyConfig.addPassthroughCopy("assets");

	eleventyConfig.addFilter("readableDate", (dateValue, locale = "en-US") => {
		if (!dateValue) return "";
		const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
		if (Number.isNaN(date.getTime())) return "";
		const formatter = new Intl.DateTimeFormat(locale, {
			year: "numeric",
			month: "long",
			day: "numeric",
			timeZone: "UTC",
		});
		return formatter.format(date);
	});

	eleventyConfig.addFilter("machineDate", (dateValue) => {
		if (!dateValue) return "";
		const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
		if (Number.isNaN(date.getTime())) return "";
		return date.toISOString().split("T")[0];
	});

	eleventyConfig.addFilter("excerpt", excerpt);

	eleventyConfig.addFilter("absoluteUrl", (path, base = "") => {
		if (!path) return "";
		try {
			const result = new URL(path, base || "http://localhost");
			return result.toString();
		} catch (error) {
			return path;
		}
	});

	eleventyConfig.on("eleventy.after", ({ results = [] } = {}) => {
		if (!Array.isArray(results) || results.length === 0) {
			return;
		}

		const knownPaths = new Set();
		for (const entry of results) {
			const url = entry?.url;
			if (!url || typeof url !== "string") continue;
			const normalized = normalizePath(url);
			knownPaths.add(normalized);
			if (normalized !== "/") {
				knownPaths.add(`${normalized}/`);
			}
		}

		const brokenLinks = [];
		for (const entry of results) {
			const { outputPath, content, url: pageUrl } = entry || {};
			if (!outputPath || !content) continue;
			if (!outputPath.endsWith(".html")) continue;

			const baseUrl = new URL(pageUrl || "/", "http://localhost");
			const linkPattern = /href=(?:"([^"]+)"|'([^']+)')/gi;
			let match;
			while ((match = linkPattern.exec(content)) !== null) {
				const href = match[1] ?? match[2];
				if (shouldSkipHref(href)) continue;
				if (!(href.startsWith("/") || href.startsWith("./") || href.startsWith("../"))) continue;

				const [hrefWithoutHash] = href.split("#");
				const [hrefWithoutQuery] = hrefWithoutHash.split("?");
				if (hasFileExtension(hrefWithoutQuery)) continue;

				let resolvedPath;
				try {
					const resolved = new URL(href, baseUrl);
					resolvedPath = normalizePath(resolved.pathname);
				} catch (error) {
					brokenLinks.push({
						source: pageUrl || outputPath,
						href,
						error: error.message,
					});
					continue;
				}

				if (!knownPaths.has(resolvedPath)) {
					brokenLinks.push({
						source: pageUrl || outputPath,
						href,
						resolvedPath,
					});
				}
			}
		}

		if (brokenLinks.length > 0) {
			const details = brokenLinks
				.map((link) => {
					const parts = [`source: ${link.source}`, `href: ${link.href}`];
					if (link.resolvedPath) {
						parts.push(`resolved: ${link.resolvedPath}`);
					}
					if (link.error) {
						parts.push(`error: ${link.error}`);
					}
					return `  • ${parts.join(", ")}`;
				})
				.join("\n");
			throw new Error(`Broken internal links detected:\n${details}`);
		}
	});

	eleventyConfig.on("eleventy.before", async () => {
		const { generateOgImages } = await import("./scripts/generate-og-images.js");
		await generateOgImages({ force: OG_FORCE_ENV });
	});
};
