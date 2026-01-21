import React, { useState, useEffect } from 'react';

function NewsCarousel() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news?q=positive+news&count=6');
      const data = await response.json();
      setNews(data.results || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      // Fallback mock data for demo
      setNews([
        {
          id: '1',
          title: 'Scientists make breakthrough in renewable energy',
          url: '#',
          thumbnail: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=300&h=200&fit=crop',
          source: 'Science Daily'
        },
        {
          id: '2', 
          title: 'Community comes together to restore local park',
          url: '#',
          thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop',
          source: 'Local News'
        },
        {
          id: '3',
          title: 'Tech company launches free coding program for kids',
          url: '#',
          thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop',
          source: 'Tech Times'
        },
        {
          id: '4',
          title: 'Ocean cleanup project removes record amount of plastic',
          url: '#',
          thumbnail: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop',
          source: 'Environmental News'
        },
        {
          id: '5',
          title: 'Medical breakthrough brings hope to rare disease patients',
          url: '#',
          thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop',
          source: 'Medical Journal'
        },
        {
          id: '6',
          title: 'Local students win international robotics competition',
          url: '#',
          thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop',
          source: 'Education Today'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="news-carousel">
        <div className="carousel-container">
          <div className="loading">Loading positive news...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="news-carousel">
      <div className="carousel-container">
        <h2 className="carousel-title">🔥 Trending Positive News</h2>
        <div className="news-cards-container">
          {news.map((article, index) => (
            <div 
              key={article.id || index}
              className="news-card"
              style={{ backgroundImage: `url(${article.thumbnail})` }}
              onClick={() => article.url && window.open(article.url, '_blank')}
            >
              <div className="news-card-overlay">
                <h3 className="news-card-title">{article.title}</h3>
                <p className="news-card-source">{article.source}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewsCarousel;