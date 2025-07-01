function createIndex() {
  return {
    keywordMap: new Map(), // keyword -> Set of URLs
    urlContentMap: new Map(), // url -> { content, title (optional) }
  };
}

function extractKeywords(pageContent) {
  // Basic keyword extraction: lowercase, split on spaces, remove common stop words
  const stopWords = new Set(['the', 'and', 'a', 'an', 'is', 'of', 'to', 'in', 'this']);
  return pageContent
    .toLowerCase()
    .split(/\W+/) // split on non-word characters
    .filter(word => word && !stopWords.has(word));
}

function addPageToIndex(index, url, pageContent, title = '') {
  const keywords = extractKeywords(pageContent);
  for (const keyword of keywords) {
    if (!index.keywordMap.has(keyword)) {
      index.keywordMap.set(keyword, new Set());
    }
    index.keywordMap.get(keyword).add(url);
  }
  index.urlContentMap.set(url, { content: pageContent, title });
}

function removePageFromIndex(index, url) {
  for (const [keyword, urls] of index.keywordMap) {
    urls.delete(url);
    if (urls.size === 0) {
      index.keywordMap.delete(keyword);
    }
  }
  index.urlContentMap.delete(url);
}

function updatePageInIndex(index, url, newPageContent, newTitle = '') {
  removePageFromIndex(index, url);
  addPageToIndex(index, url, newPageContent, newTitle);
}

function getPagesForKeyword(index, keyword) {
  return index.keywordMap.has(keyword.toLowerCase())
    ? Array.from(index.keywordMap.get(keyword.toLowerCase()))
    : [];
}

// --- TF-IDF helpers ---
function computeTF(keyword, text) {
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);
  if (words.length === 0) return 0;
  const count = words.filter(w => w === keyword).length;
  return count / words.length;
}

function computeIDF(index, keyword) {
  const N = index.urlContentMap.size;
  let docCount = 0;
  for (const { content } of index.urlContentMap.values()) {
    const words = content.toLowerCase().split(/\W+/).filter(Boolean);
    if (words.includes(keyword)) docCount++;
  }
  if (docCount === 0) return 0;
  return Math.log(N / docCount);
}

// --- Ranking Algorithm with TF-IDF ---
function rankSearchResults(index, query, searchResults) {
  const keywords = extractKeywords(query);
  // Precompute IDF for each keyword
  const idfMap = {};
  for (const kw of keywords) {
    idfMap[kw] = computeIDF(index, kw);
  }
  function relevanceScore(url) {
    const page = index.urlContentMap.get(url);
    if (!page) return 0;
    let score = 0;
    for (const kw of keywords) {
      // TF in content
      const tf = computeTF(kw, page.content);
      const idf = idfMap[kw];
      let tfidf = tf * idf;
      // Boost if keyword is in title
      if (page.title && page.title.toLowerCase().split(/\W+/).includes(kw)) {
        tfidf *= 2; // Title boost factor
      }
      score += tfidf;
    }
    return score;
  }
  return [...searchResults].sort((a, b) => relevanceScore(b) - relevanceScore(a));
}

/**
 * Search the index for a query string. Supports:
 * - Single keyword: 'cat'
 * - Multiple keywords (space-separated): 'cat dog' (AND by default)
 * - Phrase (quoted): '"cat dog"'
 *
 * @param {Object} index - The search index
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
  const urlSets = keywords.map(kw => index.keywordMap.has(kw) ? index.keywordMap.get(kw) : new Set());

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

  // Rank results using the new ranking algorithm
  return rankSearchResults(index, query, Array.from(resultUrls));
}

module.exports = {
  createIndex,
  addPageToIndex,
  removePageFromIndex,
  updatePageInIndex,
  getPagesForKeyword,
  extractKeywords,
  searchIndex,
  rankSearchResults
};