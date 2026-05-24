import { parseHTML } from 'linkedom';
import { readSitePage, readSiteFile } from './build-once.js';

export const parseHtml = (html) => parseHTML(html);

export const parsePage = (urlPath, options = {}) =>
  parseHtml(readSitePage(urlPath, options));

export const parseFile = (relativePath, options = {}) =>
  parseHtml(readSiteFile(relativePath, options));

export const textOf = (node) => (node?.textContent || '').trim();

export const selectAll = (root, selector) =>
  Array.from(root.querySelectorAll(selector));
