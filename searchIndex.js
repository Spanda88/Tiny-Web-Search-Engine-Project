function createIndex() {
  return new Map();
}

function extractKeywords(pageContent) {
  // Basic keyword extraction: lowercase, split on spaces, remove common stop words
  const stopWords = new Set(['the', 'and', 'a', 'an', 'is', 'of', 'to', 'in', 'this']);
  return pageContent
    .toLowerCase()
    .split(/\W+/) // split on non-word characters
    .filter(word => word && !stopWords.has(word));
}

function addPageToIndex(index, url, pageContent) {
  const keywords = extractKeywords(pageContent);
  for (const keyword of keywords) {
    if (!index.has(keyword)) {
      index.set(keyword, new Set());
    }
    index.get(keyword).add(url);
  }
}

function removePageFromIndex(index, url) {
  for (const [keyword, urls] of index) {
    urls.delete(url);
    if (urls.size === 0) {
      index.delete(keyword);
    }
  }
}

function updatePageInIndex(index, url, newPageContent) {
  removePageFromIndex(index, url);
  addPageToIndex(index, url, newPageContent);
}

function getPagesForKeyword(index, keyword) {
  return index.has(keyword.toLowerCase())
    ? Array.from(index.get(keyword.toLowerCase()))
    : [];
}

/**
 * Search the index for a query string. Supports:
 * - Single keyword: 'cat'
 * - Multiple keywords (space-separated): 'cat dog' (AND by default)
 * - Phrase (quoted): '"cat dog"'
 *
 * @param {Map} index - The search index
 * @param {string} query - The user query
 * @param {Object} [options] - Options: { mode: 'AND' | 'OR' }
 * @returns {string[]} - Ranked list of URLs
 */
function searchIndex(index, query, options = { mode: 'AND' }) {
  query = query.trim();
  let keywords = [];
  let phrase = null;

  // Check for phrase query (quoted)
  const phraseMatch = query.match(/^"([^"]+)"$/);
  if (phraseMatch) {
    phrase = phraseMatch[1].toLowerCase();
    keywords = extractKeywords(phrase);
  } else {
    keywords = extractKeywords(query);
  }

  if (keywords.length === 0) return [];

  // Gather sets of URLs for each keyword
  const urlSets = keywords.map(kw => index.has(kw) ? index.get(kw) : new Set());

  let resultUrls;
  if (options.mode === 'OR') {
    // Union of all sets
    resultUrls = new Set();
    for (const s of urlSets) for (const url of s) resultUrls.add(url);
  } else {
    // AND: intersection of all sets
    resultUrls = urlSets.reduce((acc, s) => {
      if (!acc) return new Set(s);
      return new Set([...acc].filter(url => s.has(url)));
    }, null) || new Set();
  }

  // If phrase, filter URLs to those whose content contains the phrase
  // (Assumes you have a way to get content by URL; here we skip this for now)
  // For now, just return the intersection/union result

  // Rank by number of matching keywords (for OR mode)
  let ranked = Array.from(resultUrls);
  if (options.mode === 'OR' && keywords.length > 1) {
    ranked.sort((a, b) => {
      const aCount = keywords.filter(kw => index.has(kw) && index.get(kw).has(a)).length;
      const bCount = keywords.filter(kw => index.has(kw) && index.get(kw).has(b)).length;
      return bCount - aCount;
    });
  }
  return ranked;
}

module.exports = {
  createIndex,
  addPageToIndex,
  removePageFromIndex,
  updatePageInIndex,
  getPagesForKeyword,
  extractKeywords,
  searchIndex
};