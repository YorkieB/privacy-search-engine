import React, { useState, useEffect } from 'react';

function SearchResults({ query, onNewSearch }) {
  const [activeTab, setActiveTab] = useState('web');
  const [webResults, setWebResults] = useState([]);
  const [imageResults, setImageResults] = useState([]);
  const [newsResults, setNewsResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      fetchResults(query);
    }
  }, [query]);

  const fetchResults = async (searchTerm) => {
    setLoading(true);
    try {
      // Fetch all three types of results
      const [webResponse, imageResponse, newsResponse] = await Promise.all([
        fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`),
        fetch(`/api/images?q=${encodeURIComponent(searchTerm)}`),
        fetch(`/api/news?q=${encodeURIComponent(searchTerm)}`)
      ]);

      const [webData, imageData, newsData] = await Promise.all([
        webResponse.json(),
        imageResponse.json(), 
        newsResponse.json()
      ]);

      setWebResults(webData.results || []);
      setImageResults(imageData.results || []);
      setNewsResults(newsData.results || []);
    } catch (error) {
      console.error('Error fetching search results:', error);
      // Set mock data for demonstration
      setWebResults([
        {
          title: 'Privacy Search - Secure Web Search',
          url: 'https://example.com',
          description: 'A privacy-focused search engine that does not track users or store personal information.',
          domain: 'example.com'
        },
        {
          title: 'How to Search the Web Privately',
          url: 'https://guide.com',
          description: 'Learn about privacy-focused search engines and techniques to search the web without being tracked.',
          domain: 'guide.com'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNewSearch(searchQuery.trim());
    }
  };

  const renderWebResults = () => {
    if (loading) return <div className="loading">Searching...</div>;
    if (!webResults.length) return <div className="loading">No results found</div>;

    return webResults.map((result, index) => (
      <div key={index} className="web-result">
        <div className="web-result-url">{result.domain || new URL(result.url).hostname}</div>
        <a href={result.url} target="_blank" rel="noopener noreferrer" className="web-result-title">
          {result.title}
        </a>
        <p className="web-result-description">{result.description}</p>
      </div>
    ));
  };

  const renderImageResults = () => {
    if (loading) return <div className="loading">Loading images...</div>;
    if (!imageResults.length) return <div className="loading">No images found</div>;

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {imageResults.map((image, index) => (
          <div key={index} style={{ borderRadius: '8px', overflow: 'hidden' }}>
            <img 
              src={image.thumbnail || image.url} 
              alt={image.title}
              style={{ width: '100%', height: '150px', objectFit: 'cover' }}
              onClick={() => window.open(image.url, '_blank')}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderNewsResults = () => {
    if (loading) return <div className="loading">Loading news...</div>;
    if (!newsResults.length) return <div className="loading">No news found</div>;

    return newsResults.map((article, index) => (
      <div key={index} className="web-result">
        <div className="web-result-url">{article.source}</div>
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="web-result-title">
          {article.title}
        </a>
        <p className="web-result-description">{article.description}</p>
        {article.publishedAt && (
          <div style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>
            {new Date(article.publishedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="search-results-page">
      <div className="search-header">
        <div className="search-header-container">
          <form className="compact-search-box" onSubmit={handleSearch}>
            <input
              type="text"
              className="compact-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
            />
            <button type="submit" className="search-button">
              🔍
            </button>
          </form>
        </div>
      </div>

      <div className="search-results-container">
        <div className="main-results">
          <div className="search-tabs">
            <button 
              className={`search-tab ${activeTab === 'web' ? 'active' : ''}`}
              onClick={() => setActiveTab('web')}
            >
              Web
            </button>
            <button 
              className={`search-tab ${activeTab === 'images' ? 'active' : ''}`}
              onClick={() => setActiveTab('images')}
            >
              Images
            </button>
            <button 
              className={`search-tab ${activeTab === 'news' ? 'active' : ''}`}
              onClick={() => setActiveTab('news')}
            >
              News
            </button>
          </div>

          <div className="results-content">
            {activeTab === 'web' && renderWebResults()}
            {activeTab === 'images' && renderImageResults()}
            {activeTab === 'news' && renderNewsResults()}
          </div>
        </div>

        <div className="sidebar">
          <div className="sidebar-widget">
            <h3 className="widget-title">Search Tips</h3>
            <ul style={{ listStyle: 'none', padding: 0, color: '#666' }}>
              <li style={{ marginBottom: '10px' }}>• Use quotes for exact phrases</li>
              <li style={{ marginBottom: '10px' }}>• Add + before important terms</li>
              <li style={{ marginBottom: '10px' }}>• Use - to exclude terms</li>
              <li style={{ marginBottom: '10px' }}>• Try different keywords</li>
            </ul>
          </div>
          
          <div className="sidebar-widget">
            <h3 className="widget-title">Privacy Info</h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.4' }}>
              Your searches are not tracked, stored, or shared. We use Brave Search API 
              to provide results while protecting your privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchResults;