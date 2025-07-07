const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {
  createIndex,
  addPageToIndex,
  getPagesForKeyword,
  searchIndex
} = require('./searchIndex');

const app = express();
const port = 3001;
const index = createIndex();

// Add some demo data
addPageToIndex(index, 'https://example.com/cats', 'Cats are wonderful pets. They love to sleep and play.', 'Cats');
addPageToIndex(index, 'https://example.com/dogs', 'Dogs are loyal and friendly animals. They enjoy walks.', 'Dogs');
addPageToIndex(index, 'https://example.com/cats-vs-dogs', 'Cats and dogs are both popular pets. Some people prefer cats, others prefer dogs.', 'Cats vs Dogs');
addPageToIndex(index, 'https://example.com/pets', 'Pets bring joy to our lives. Whether you choose cats, dogs, or other animals, they become part of the family.', 'Pets');
addPageToIndex(index, 'https://example.com/animal-care', 'Taking care of animals requires love, patience, and proper nutrition. Regular vet visits are important.', 'Animal Care');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.get('/api/search', (req, res) => {
  const { query, mode = 'AND' } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }
  
  const results = searchIndex(index, query, { mode });
  res.json({ results, query, mode });
});

app.post('/api/add-page', (req, res) => {
  const { url, content, title = '' } = req.body;
  if (!url || !content) {
    return res.status(400).json({ error: 'URL and content are required' });
  }
  
  addPageToIndex(index, url, content, title);
  res.json({ message: 'Page added successfully', url });
});

app.get('/api/stats', (req, res) => {
  const totalPages = index.urlContentMap.size;
  const totalKeywords = index.keywordMap.size;
  res.json({ totalPages, totalKeywords });
});

// Legacy routes for backward compatibility
app.get('/', (req, res) => {
  res.send(`
    <h1>Tiny Web Search Engine</h1>
    <p>API is running. Use the frontend at <a href="http://localhost:3000">http://localhost:3000</a></p>
    <form method="POST" action="/add">
      <h3>Add Page</h3>
      URL: <input name="url" required /><br>
      Content: <input name="content" required /><br>
      <button type="submit">Add Page</button>
    </form>
    <form method="GET" action="/search">
      <h3>Search</h3>
      Query: <input name="keyword" required /><br>
      Mode: <select name="mode">
        <option value="AND">AND (all keywords)</option>
        <option value="OR">OR (any keyword)</option>
      </select><br>
      <button type="submit">Search</button>
    </form>
  `);
});

app.post('/add', (req, res) => {
  const { url, content } = req.body;
  // For demo: treat first word as title, rest as content
  const [title, ...bodyArr] = content.split(' ');
  const body = bodyArr.join(' ');
  addPageToIndex(index, url, body, title);
  res.send(`<p>Added page: ${url}</p><a href="/">Back</a>`);
});

app.get('/search', (req, res) => {
  const keyword = req.query.keyword;
  const mode = req.query.mode || 'AND';
  const results = searchIndex(index, keyword, { mode });
  res.send(`
    <h1>Search Results for "${keyword}" (${mode})</h1>
    <ul>
      ${results.map(url => `<li>${url}</li>`).join('')}
    </ul>
    <a href="/">Back</a>
  `);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Frontend should be running at http://localhost:3000`);
});