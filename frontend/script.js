// Configuration
const API_URL = 'http://127.0.0.1:5000';

// State
let allArticles = [];
let currentCategory = 'all';

// Create animated background bubbles
function createBubbles() {
    const bg = document.getElementById('bg');
    for (let i = 0; i < 20; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        const size = Math.random() * 100 + 50;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.left = Math.random() * 100 + '%';
        bubble.style.top = Math.random() * 100 + '%';
        bubble.style.animationDelay = Math.random() * 5 + 's';
        bg.appendChild(bubble);
    }
}

// Fetch trending news
async function fetchTrendingNews() {
    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/trending`);
        const data = await response.json();
        
        if (data.status === 'ok') {
            allArticles = data.articles;
            displayArticles(allArticles);
            updateStats(data);
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        showError('Failed to fetch news. Please check if the backend is running on port 5000.');
    } finally {
        showLoading(false);
    }
}

// Fetch news by category
async function fetchNewsByCategory(category) {
    try {
        showLoading(true);
        const url = category === 'all' 
            ? `${API_URL}/trending`
            : `${API_URL}/news?category=${category}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'ok') {
            allArticles = data.articles;
            displayArticles(allArticles);
        }
    } catch (error) {
        console.error('Error fetching category news:', error);
        showError('Failed to fetch news for this category.');
    } finally {
        showLoading(false);
    }
}

// Filter news by category
function filterNews(category) {
    currentCategory = category;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    fetchNewsByCategory(category);
}

// Search articles
async function searchArticles() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (!query) {
        alert('Please enter a search keyword');
        return;
    }
    
    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.status === 'ok') {
            allArticles = data.articles;
            displayArticles(allArticles);
            
            if (data.articles.length === 0) {
                showError(`No articles found for "${query}"`);
            }
        }
    } catch (error) {
        console.error('Error searching:', error);
        showError('Search failed. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Display articles in grid
function displayArticles(articles) {
    const grid = document.getElementById('newsGrid');
    grid.innerHTML = '';
    
    if (articles.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No articles found</p>';
        return;
    }
    
    articles.forEach((article, index) => {
        const card = createArticleCard(article, index);
        grid.appendChild(card);
    });
}

// Create article card element
function createArticleCard(article, index) {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
        <div class="card-header">
            <span class="source-badge">${article.source}</span>
            <span class="sentiment-badge ${article.sentiment}">${article.sentiment}</span>
        </div>
        <h3>${article.title}</h3>
        <p>${article.description || 'No description available'}</p>
        <div class="card-footer">
            <span class="score">Score: ${article.score || 0}</span>
            <span class="category-tag">${article.category || 'general'}</span>
        </div>
    `;
    
    card.onclick = () => {
        if (article.url) {
            window.open(article.url, '_blank');
        }
    };
    
    return card;
}

// Update statistics
function updateStats(data) {
    document.getElementById('totalArticles').textContent = data.total_articles || 0;
    document.getElementById('totalSources').textContent = data.sources?.length || 3;
    
    // Count positive sentiment
    const positiveCount = data.articles?.filter(a => a.sentiment === 'positive').length || 0;
    document.getElementById('positiveCount').textContent = positiveCount;
}

// Load statistics page
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const data = await response.json();
        
        if (data.status === 'ok') {
            displayKeywords(data.trending_keywords);
            displayStatsModal(data);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        alert('Failed to load statistics');
    }
}

// Display trending keywords
function displayKeywords(keywords) {
    const section = document.getElementById('keywordSection');
    
    if (!keywords || keywords.length === 0) {
        section.innerHTML = '';
        return;
    }
    
    section.innerHTML = `
        <div class="keyword-cloud">
            <h2>Trending Keywords</h2>
            <div class="keywords">
                ${keywords.slice(0, 15).map(k => 
                    `<span class="keyword" style="font-size: ${0.9 + k.count * 0.05}rem">
                        ${k.word} (${k.count})
                    </span>`
                ).join('')}
            </div>
        </div>
    `;
}

// Display statistics modal
function displayStatsModal(data) {
    const categories = data.category_distribution || {};
    const sentiments = data.sentiment_distribution || {};
    
    const message = `
Statistics Overview:
━━━━━━━━━━━━━━━━━━
Total Articles: ${data.total_articles}

Categories:
${Object.entries(categories).map(([cat, count]) => `  • ${cat}: ${count}`).join('\n')}

Sentiments:
${Object.entries(sentiments).map(([sent, count]) => `  • ${sent}: ${count}`).join('\n')}

Top Keywords: ${data.trending_keywords?.slice(0, 5).map(k => k.word).join(', ') || 'N/A'}
    `;
    
    alert(message);
}

// Load analytics
async function loadAnalytics() {
    try {
        const response = await fetch(`${API_URL}/analytics`);
        const data = await response.json();
        
        if (data.status === 'ok') {
            displayAnalyticsModal(data);
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        alert('Failed to load analytics');
    }
}

// Display analytics modal
function displayAnalyticsModal(data) {
    const overview = data.overview || {};
    const trends = data.trends || {};
    
    const message = `
Advanced Analytics:
━━━━━━━━━━━━━━━━━━
Most Popular Category: ${trends.most_popular_category || 'N/A'}

Sentiment Distribution:
  • Positive: ${trends.sentiment_ratio?.positive || 0}%
  • Negative: ${trends.sentiment_ratio?.negative || 0}%
  • Neutral: ${trends.sentiment_ratio?.neutral || 0}%

Top Articles:
${data.top_articles?.map((a, i) => `  ${i+1}. ${a.title} (Score: ${a.score})`).join('\n') || 'N/A'}
    `;
    
    alert(message);
}

// Show about information
function showAbout() {
    const message = `
NewsHub Aggregator v69.0
━━━━━━━━━━━━━━━━━━━━━━━
A professional news aggregation platform that combines news from multiple sources with AI-powered analysis.

Features:
  • Multi-source aggregation (NewsAPI, HackerNews, Reddit)
  • AI-powered sentiment analysis
  • Smart categorization
  • Real-time search
  • Trending keywords extraction
  • Advanced analytics

Built with Flask, Python, and modern web technologies.
    `;
    
    alert(message);
}

// Show/hide loading spinner
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    document.getElementById('newsGrid').style.display = show ? 'none' : 'grid';
}

// Show error message
function showError(message) {
    const grid = document.getElementById('newsGrid');
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <h3>Error</h3>
            <p>${message}</p>
            <button onclick="fetchTrendingNews()" class="nav-btn" style="margin-top: 1rem;">
                Try Again
            </button>
        </div>
    `;
}

// Allow search on Enter key
document.addEventListener('DOMContentLoaded', () => {
    createBubbles();
    fetchTrendingNews();
    
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchArticles();
        }
    });
});

// Refresh data every 5 minutes
setInterval(() => {
    if (currentCategory === 'all') {
        fetchTrendingNews();
    } else {
        fetchNewsByCategory(currentCategory);
    }
}, 300000); 
