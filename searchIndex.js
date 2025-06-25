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

module.exports = {
  createIndex,
  addPageToIndex,
  removePageFromIndex,
  updatePageInIndex,
  getPagesForKeyword,
  extractKeywords
};