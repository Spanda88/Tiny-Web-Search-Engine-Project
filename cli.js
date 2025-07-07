const readline = require('readline');
const {
  createIndex,
  addPageToIndex,
  searchIndex
} = require('./searchIndex');

// --- Demo: Build a simple in-memory index ---
const index = createIndex();
addPageToIndex(index, 'https://example.com/cats', 'Cats are wonderful pets. They love to sleep and play.');
addPageToIndex(index, 'https://example.com/dogs', 'Dogs are loyal and friendly animals. They enjoy walks.');
addPageToIndex(index, 'https://example.com/cats-vs-dogs', 'Cats and dogs are both popular pets. Some people prefer cats, others prefer dogs.');

// --- CLI Setup ---
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'Search> '
});

console.log('Welcome to the CLI Search Engine!');
console.log('Type your search query and press Enter. Type "exit" to quit.');
rl.prompt();

rl.on('line', (line) => {
  const input = line.trim();
  if (input.toLowerCase() === 'exit') {
    console.log('Goodbye!');
    rl.close();
    return;
  }
  if (!input) {
    rl.prompt();
    return;
  }
  const results = searchIndex(index, input);
  if (results.length > 0) {
    console.log('\nSearch Results:');
    results.forEach((url, i) => {
      console.log(`${i + 1}. ${url}`);
    });
  } else {
    console.log('No results found.');
  }
  rl.prompt();
});

rl.on('close', () => {
  process.exit(0);
});
