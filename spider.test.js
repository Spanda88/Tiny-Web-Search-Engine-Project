const { crawl } = require('./spider');
const { createIndex, addPageToIndex } = require('./searchIndex');

jest.mock('./searchIndex', () => ({
  ...jest.requireActual('./searchIndex'),
  addPageToIndex: jest.fn(),
}));

require('jest-fetch-mock').enableMocks();

beforeEach(() => {
  fetch.resetMocks();
  require('./searchIndex').addPageToIndex.mockClear();
});

it('should crawl a single page and add it to the index', async () => {
  const index = createIndex();
  fetch
    .mockResponseOnce('') // robots.txt (not found)
    .mockResponseOnce('<html><body>Hello World</body></html>'); // page

  await crawl('https://www.example.com', index);

  expect(require('./searchIndex').addPageToIndex).toHaveBeenCalledWith(
    'https://www.example.com',
    expect.stringContaining('Hello World'),
    index
  );
});

it('should follow links and crawl multiple pages', async () => {
  const index = createIndex();
  fetch
    .mockResponseOnce('') // robots.txt
    .mockResponseOnce('<html><body><a href="/about">About</a>Home</body></html>') // /
    .mockResponseOnce('<html><body>About Us</body></html>'); // /about

  await crawl('https://www.example.com', index);

  expect(require('./searchIndex').addPageToIndex).toHaveBeenCalledWith(
    'https://www.example.com',
    expect.any(String),
    index
  );
  expect(require('./searchIndex').addPageToIndex).toHaveBeenCalledWith(
    'https://www.example.com/about',
    expect.stringContaining('About Us'),
    index
  );
});
it('should respect robots.txt and avoid disallowed paths', async () => {
  const index = createIndex();
  fetch
    .mockResponseOnce('User-agent: *\nDisallow: /private') // robots.txt
    .mockResponseOnce('<html><body><a href="/private/secret">Secret</a>Home</body></html>'); // /

  await crawl('https://www.example.com', index);

  // Should only add the homepage, not the disallowed /private/secret
  expect(require('./searchIndex').addPageToIndex).toHaveBeenCalledWith(
    'https://www.example.com',
    expect.any(String),
    index
  );
  expect(require('./searchIndex').addPageToIndex).not.toHaveBeenCalledWith(
    'https://www.example.com/private/secret',
    expect.any(String),
    index
  );
});

