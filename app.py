from flask import Flask, jsonify
import requests 
from dotenv import load_dotenv
import os

load_dotenv()

app=Flask(__name__)

"""News from Hacker news """
def fetch_hackernews():
    top_news_url='https://hacker-news.firebaseio.com/v0/topstories.json'
    response=requests.get(top_news_url)
    story_ids=response.json()

    top_10_ids=story_ids[:10]

    articles=[]
    
    for story_id in top_10_ids:
        story_url=f'https://hacker-news.firebaseio.com/v0/item/{story_id}.json'
        story_response=requests.get(story_url)
        story_data=story_response.json()

        if story_data and story_data.get('type')=='story':
            articles.append(story_data)

    return articles

"""news from reddit"""
def fetch_reddit():
    articles = []
    
    subreddits = ['news', 'worldnews', 'technology', 'indianews']
    
    for subreddit in subreddits:
        url = f'https://www.reddit.com/r/{subreddit}/hot.json?limit=5'
        
        headers = {'User-Agent': 'NewsAggregator/1.0'}
        response = requests.get(url, headers=headers)
        data = response.json()
        
        posts = data['data']['children']

        for post in posts:
            post_data = post['data']
            if not post_data['is_self']:
                articles.append({
                    'title': post_data['title'],
                    'url': post_data['url'],
                    'score': post_data['score'],
                    'subreddit': post_data['subreddit'],
                    'created_utc': post_data['created_utc'],
                    'num_comments': post_data['num_comments']
                })
    
    return articles

"""Normalize all articles to a consistent format"""
def normalize_article(article, source):
    """
    Convert articles from different sources into one standard format
    
    Standard format:
    {
        'title': str,
        'url': str,
        'source': str,
        'published_date': str (human readable),
        'score': int,
        'description': str
    }
    """
    from datetime import datetime
    
    normalized = {}
    
    if source == 'NewsAPI':
        normalized = {
            'title': article.get('title', 'No title'),
            'url': article.get('url', ''),
            'source': f"NewsAPI - {article.get('source', {}).get('name', 'Unknown')}",
            'published_date': article.get('publishedAt', ''),
            'score': 0,  
            'description': article.get('description', '')[:200]  
        }
    
    elif source == 'HackerNews':
        # Convert unix timestamp to readable date
        timestamp = article.get('time', 0)
        date_str = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')
        
        normalized = {
            'title': article.get('title', 'No title'),
            'url': article.get('url', ''),
            'source': 'HackerNews',
            'published_date': date_str,
            'score': article.get('score', 0),
            'description': f"Posted by {article.get('by', 'unknown')} | {article.get('descendants', 0)} comments"
        }
    
    elif source == 'Reddit':
        # Convert unix timestamp to readable date
        timestamp = article.get('created_utc', 0)
        date_str = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')
        
        normalized = {
            'title': article.get('title', 'No title'),
            'url': article.get('url', ''),
            'source': f"Reddit - r/{article.get('subreddit', 'unknown')}",
            'published_date': date_str,
            'score': article.get('score', 0),
            'description': f"{article.get('num_comments', 0)} comments"
        }
    
    return normalized


@app.route('/')
def home():
    return "News aggregator API is running! go to /trending to see news"


"""Trendning news from news api """
@app.route('/trending')
def trending():
    API_KEY=os.getenv('NEWSAPI_KEY')

    newsapi_url = f'https://newsapi.org/v2/top-headlines?country=us&apiKey={API_KEY}'
    newsapi_response = requests.get(newsapi_url)
    newsapi_data = newsapi_response.json()
    
    hackernews_articles = fetch_hackernews()
    reddit_articles = fetch_reddit()


    # normalize articles from each source
    newsapi_normalized = []
    for article in newsapi_data.get('articles', [])[:5]:  # Take top 5 from each
        newsapi_normalized.append(normalize_article(article, 'NewsAPI'))
    
    hackernews_normalized = []
    for article in hackernews_articles[:5]:
        hackernews_normalized.append(normalize_article(article, 'HackerNews'))
    
    reddit_normalized = []
    for article in reddit_articles[:5]:
        reddit_normalized.append(normalize_article(article, 'Reddit'))
    
    # Interleave articles from all sources for diversity
    mixed_articles = []
    max_len = max(len(newsapi_normalized), len(hackernews_normalized), len(reddit_normalized))
    
    for i in range(max_len):
        if i < len(newsapi_normalized):
            mixed_articles.append(newsapi_normalized[i])
        if i < len(hackernews_normalized):
            mixed_articles.append(hackernews_normalized[i])
        if i < len(reddit_normalized):
            mixed_articles.append(reddit_normalized[i])
    
    return jsonify({
        'status': 'ok',
        'total_articles': len(mixed_articles),
        'sources': ['NewsAPI (India)', 'HackerNews', 'Reddit (India)'],
        'articles': mixed_articles[:15]  # Return top 15
    })






if __name__=='__main__':
    app.run(debug=True, port=5000)
