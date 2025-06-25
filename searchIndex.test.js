const {
  createIndex,
  addPageToIndex,
  removePageFromIndex,
  updatePageInIndex,
  getPagesForKeyword
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