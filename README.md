# Tiny-Web-Search-Engine-Project
This is a JavaScript implementation of a tiny web search engine

## Objectives
Create a search engine that contains: 
- Search index
- Search algorithm
- Ranking algorithm
- Spider / web crawler

Features:
- Add new web pages to knowledge base
- Update info as web pages are updated (accuracy)
- Remove outdated / irrelevant web pages (concise)
- Keyword searches (can handle different types of queries - covering single keywords, multiple keywords, and phrases)
- Orders searches based on relevance
- Determining Relevance: Considers keyword frequency / location, weighted scoring, and Term Frequency-Inverse Document Frequency (TF-IDF)
- Considers page's popularity or authority in the future
- Search Engine: auto-discovers / indexes new web pages, respect website rules / avoid overloading their servers, follow links within the web pages to discover more content

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Search Algorithm**: TF-IDF with custom ranking
- **Styling**: Modern CSS with gradients and animations
- **Testing**: Jest

## How to Use

1. **Start the Backend Server** (from the root directory):
   ```bash
   npm run server
   ```

2. **Start the Frontend** (from the root directory):
   ```bash
   npm run client
   ```

3. **Or run both simultaneously**:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## API Endpoints

The backend provides these REST API endpoints:
- `GET /api/search?query=<query>&mode=<AND|OR>` - Search the index
- `POST /api/add-page` - Add a new page to the index
- `GET /api/stats` - Get index statistics 

### Author: Shefali Panda
