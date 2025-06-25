const express = require('express');
const bodyParser = require('body-parser');
const {
  createIndex,
  addPageToIndex,
  getPagesForKeyword
} = require('./searchIndex');

const app = express();
const port = 3000;
const index = createIndex();

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`
    <h1>Tiny Web Search Engine</h1>
    <form method="POST" action="/add">
      <h3>Add Page</h3>
      URL: <input name="url" required /><br>
      Content: <input name="content" required /><br>
      <button type="submit">Add Page</button>
    </form>
    <form method="GET" action="/search">
      <h3>Search</h3>
      Keyword: <input name="keyword" required /><br>
      <button type="submit">Search</button>
    </form>
  `);
});

app.post('/add', (req, res) => {
  const { url, content } = req.body;
  addPageToIndex(index, url, content);
  res.send(`<p>Added page: ${url}</p><a href="/">Back</a>`);
});

app.get('/search', (req, res) => {
  const keyword = req.query.keyword;
  const results = getPagesForKeyword(index, keyword);
  res.send(`
    <h1>Search Results for "${keyword}"</h1>
    <ul>
      ${results.map(url => `<li>${url}</li>`).join('')}
    </ul>
    <a href="/">Back</a>
  `);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});