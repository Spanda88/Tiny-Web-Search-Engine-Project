const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { URL } = require('url');
const { addPageToIndex } = require('./searchIndex');

async function fetchRobotsTxt(baseUrl) {
  try {
    const robotsUrl = new URL('/robots.txt', baseUrl).href;
    const res = await fetch(robotsUrl);
    if (!res.ok) return [];
    const text = await res.text();
    return text
      .split('\n')
      .filter(line => line.startsWith('Disallow:'))
      .map(line => line.replace('Disallow:', '').trim());
  } catch {
    return [];
  }
}

function isAllowedByRobots(url, disallowedPaths) {
  const path = new URL(url).pathname;
  return !disallowedPaths.some(disallowed => path.startsWith(disallowed));
}

function extractLinksAndText(html, baseUrl) {
  const $ = cheerio.load(html);
  const links = [];
  $('a[href]').each((_, el) => {
    let href = $(el).attr('href');
    try {
      href = new URL(href, baseUrl).href;
      links.push(href);
    } catch {}
  });
  const text = $('body').text();
  return { links, text };
}

async function crawl(startingUrl, index, options = {}) {
  const {
    maxDepth = 2,
    maxPages = 100,
    delay = 500,
    sameDomain = true,
    visited = new Set(),
    depth = 0,
    robotsCache = {},
  } = options;

  if (visited.size >= maxPages || depth > maxDepth) return;
  if (visited.has(startingUrl)) return;
  visited.add(startingUrl);

  const baseUrl = new URL(startingUrl).origin;
  if (!robotsCache[baseUrl]) {
    robotsCache[baseUrl] = await fetchRobotsTxt(baseUrl);
  }
  if (!isAllowedByRobots(startingUrl, robotsCache[baseUrl])) return;

  let res;
  try {
    res = await fetch(startingUrl);
    if (!res.ok) return;
  } catch {
    return;
  }
  const html = await res.text();
  const { links, text } = extractLinksAndText(html, startingUrl);
  addPageToIndex(startingUrl, text, index);

  for (const link of links) {
    if (sameDomain && new URL(link).origin !== baseUrl) continue;
    await new Promise(r => setTimeout(r, delay));
    await crawl(link, index, {
      ...options,
      visited,
      depth: depth + 1,
      robotsCache,
    });
  }
}

module.exports = { crawl, fetchRobotsTxt, isAllowedByRobots, extractLinksAndText };
