

***

# NewsHub Aggregator

**NewsHub Aggregator** is a multi-source news aggregation service powered by AI for categorization and sentiment analytics. It pulls trending articles from NewsAPI, HackerNews, and Reddit, then consolidates, categorizes, and analyzes news, providing a robust API for real-time insights.[1]

***

### Features

- Multi-source aggregation: NewsAPI, HackerNews, Reddit
- Intelligent categorization of news into technology, business, sports, entertainment, and general
- AI-powered sentiment analysis for articles
- Trending keywords extraction for insight into popular topics
- Real-time caching for improved performance
- Comprehensive analytics and dashboard endpoints
- API documentation and error handling for usability

***

### Requirements

- Python 3.8+
- Flask
- Flask-CORS
- python-dotenv
- requests

Install dependencies via:

```bash
pip install flask flask-cors python-dotenv requests
```
Other standard libraries used are already included with Python.

***

### Environment Variables

Create a `.env` file in the project root and add your NewsAPI key:

```
NEWSAPIKEY=your_newsapi_key_here
```

***

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/YOUR_USERNAME/newshub-aggregator.git
    cd newshub-aggregator
    ```
2. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3. Set up your `.env` file as described above.

***

### Usage

Start the Flask app on default port 5000:

```bash
python app.py
```

Access the API at `http://localhost:5000`

***

### API Endpoints

| Endpoint                  | Method | Description                                                                |
|---------------------------|--------|----------------------------------------------------------------------------|
| `/`                       | GET    | Basic status check message                                                 |
| `/trending`               | GET    | Returns trending articles from all sources                                 |
| `/news?category={cat}`    | GET    | Get news filtered by category (technology, sports, entertainment, business, general, all) |
| `/summaryint/{articleid}` | GET    | Get AI-generated summary of an article                                     |
| `/analytics`              | GET    | Advanced analytics dashboard data                                          |
| `/stats`                  | GET    | Get statistics and trending keywords                                       |
| `/search?q={keyword}`     | GET    | Search articles by keyword                                                 |
| `/sources`                | GET    | Get list of all news sources                                               |
| `/docs`                   | GET    | API documentation (JSON format)                                            |

***

### Example API Usage

- **Get trending news:**
  ```
  GET /trending
  ```
- **Get technology news:**
  ```
  GET /news?category=technology
  ```
- **Search for 'AI':**
  ```
  GET /search?q=AI
  ```
- **Show trending keywords and stats:**
  ```
  GET /stats
  ```
- **API info:**
  ```
  GET /docs
  ```

***

### Error Handling

- Returns JSON error messages for unknown endpoints and server errors.
- Handles missing parameters/highlights available endpoints.

***

### Project Structure

- `app.py` &mdash; Main Flask application with all API routes and utility functions
- `.env` &mdash; Store API keys and secrets

***

### Contributing

- Fork the repository and create a branch for your feature or bug fix.
- Follow PEP-8 style guidelines and include meaningful docstrings.
- Submit Pull Requests with clear explanations.

***

### License

This project is released under the MIT License.

***

***
