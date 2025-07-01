const {
  createIndex,
  addPageToIndex,
  removePageFromIndex,
  updatePageInIndex,
  getPagesForKeyword,
  searchIndex
} = require('./searchIndex');

describe('Search Index', () => {
  let index;

  beforeEach(() => {
    index = createIndex();
  });

  test('should add a new page to the index', () => {
    addPageToIndex(index, 'https://example.com', 'This is a page about dogs');
    expect(getPagesForKeyword(index, 'dogs')).toContain('https://example.com');
  });

  test('should update a page in the index', () => {
    addPageToIndex(index, 'https://example.com', 'This is a page about dogs');
    updatePageInIndex(index, 'https://example.com', 'This is a page about cats');
    expect(getPagesForKeyword(index, 'dogs')).not.toContain('https://example.com');
    expect(getPagesForKeyword(index, 'cats')).toContain('https://example.com');
  });

  test('should remove a page from the index', () => {
    addPageToIndex(index, 'https://example.com', 'This is a page about cats');
    removePageFromIndex(index, 'https://example.com');
    expect(getPagesForKeyword(index, 'cats')).not.toContain('https://example.com');
  });

  test('should return relevant pages for a keyword', () => {
    addPageToIndex(index, 'https://www.example.com', 'This is a sample web page about cats');
    expect(getPagesForKeyword(index,'cats')).toContain('https://www.example.com');
    });

  test('should return empty array for unknown keyword', () => {
    expect(getPagesForKeyword(index, 'unknown')).toEqual([]);
  });
});

describe('Search Algorithm', () => {
  let index;
  beforeEach(() => {
    index = createIndex();
    addPageToIndex(index, 'https://a.com', 'Cats and dogs are friends');
    addPageToIndex(index, 'https://b.com', 'Cats are cute');
    addPageToIndex(index, 'https://c.com', 'Dogs are loyal');
    addPageToIndex(index, 'https://d.com', 'Birds are smart');
  });

  test('single keyword returns relevant pages', () => {
    const results = searchIndex(index, 'cats');
    expect(results).toEqual(expect.arrayContaining(['https://a.com', 'https://b.com']));
  });

  test('multiple keywords (AND) returns intersection', () => {
    const results = searchIndex(index, 'cats dogs');
    expect(results).toEqual(['https://a.com']);
  });

  test('multiple keywords (OR) returns union, ranked', () => {
    const results = searchIndex(index, 'cats dogs', { mode: 'OR' });
    expect(results).toEqual(expect.arrayContaining(['https://a.com', 'https://b.com', 'https://c.com']));
    expect(results[0]).toBe('https://a.com'); // a.com matches both
  });

  test('phrase query (quoted) returns relevant pages', () => {
    addPageToIndex(index, 'https://e.com', 'cats dogs');
    const results = searchIndex(index, '"cats dogs"');
    // Should return pages containing both words (since we do not check for exact phrase in content)
    expect(results).toEqual(expect.arrayContaining(['https://a.com', 'https://e.com']));
  });

  test('unknown keyword returns empty array', () => {
    const results = searchIndex(index, 'unicorns');
    expect(results).toEqual([]);
  });
});