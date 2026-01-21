import React, { useState, useEffect } from 'react';

function SearchResults({ query, onNewSearch, activeTab: propActiveTab, onTabChange }) {
  const [activeTab, setActiveTab] = useState(propActiveTab || 'web');
  const [webResults, setWebResults] = useState([]);
  const [imageResults, setImageResults] = useState([]);
  const [newsResults, setNewsResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(query);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  // Update local activeTab when prop changes and reset to page 1
  useEffect(() => {
    if (propActiveTab) {
      setActiveTab(propActiveTab);
      setCurrentPage(1);
    }
  }, [propActiveTab]);

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      setCurrentPage(1);
      fetchResults(query);
    }
  }, [query]);

  const getPageResults = () => {
    let results = [];
    if (activeTab === 'web') {
      results = webResults;
    } else if (activeTab === 'images') {
      results = imageResults;
    } else if (activeTab === 'news') {
      results = newsResults;
    }
    
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    return results.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    let results = [];
    if (activeTab === 'web') {
      results = webResults;
    } else if (activeTab === 'images') {
      results = imageResults;
    } else if (activeTab === 'news') {
      results = newsResults;
    }
    return Math.ceil(results.length / resultsPerPage);
  };

  const fetchResults = async (searchTerm) => {
    setLoading(true);
    try {
      // Fetch all three types of results with count parameter for more results
      const [webResponse, imageResponse, newsResponse] = await Promise.all([
        fetch(`/api/search?q=${encodeURIComponent(searchTerm)}&count=20`),
        fetch(`/api/images?q=${encodeURIComponent(searchTerm)}&count=20`),
        fetch(`/api/news?q=${encodeURIComponent(searchTerm)}&count=20`)
      ]);

      console.log('Web response status:', webResponse.status);
      console.log('Image response status:', imageResponse.status);
      console.log('News response status:', newsResponse.status);

      const [webData, imageData, newsData] = await Promise.all([
        webResponse.json(),
        imageResponse.json(), 
        newsResponse.json()
      ]);

      console.log('Web results:', webData);
      console.log('Image results:', imageData);
      console.log('News results:', newsData);

      setWebResults(webData.results || webData || []);
      setImageResults(imageData.results || imageData || []);
      setNewsResults(newsData.results || newsData || []);
    } catch (error) {
      console.error('Error fetching search results:', error);
      // Provide more realistic mock data for demonstration
      setWebResults([
        {
          title: 'Privacy-Focused Search Engines - A Complete Guide',
          url: 'https://example.com/privacy-search',
          description: 'Explore the best privacy-focused search engines that protect your personal information and don\'t track your searches.',
          domain: 'example.com'
        },
        {
          title: 'How to Search the Web Privately Without Being Tracked',
          url: 'https://guide.com/private-search',
          description: 'Learn techniques and tools to search the web without leaving a digital footprint. Includes best practices for anonymous searching.',
          domain: 'guide.com'
        },
        {
          title: 'Why Privacy Matters in Online Search',
          url: 'https://privacy.org/search-privacy',
          description: 'Understanding the importance of search privacy and how to protect your data while browsing the internet.',
          domain: 'privacy.org'
        },
        {
          title: 'Brave Search - Privacy First Search Engine',
          url: 'https://search.brave.com',
          description: 'A privacy-centric search engine that offers fast, unbiased results without tracking or data collection.',
          domain: 'search.brave.com'
        },
        {
          title: 'DuckDuckGo vs Google: Privacy Comparison',
          url: 'https://comparison.com/duckduckgo',
          description: 'Detailed comparison between privacy-focused search engines and traditional search engines.',
          domain: 'comparison.com'
        }
      ]);
      setImageResults([
        {
          title: 'Privacy concept image',
          url: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400&h=300&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=200&h=150&fit=crop'
        },
        {
          title: 'Secure search illustration',
          url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=200&h=150&fit=crop'
        },
        {
          title: 'Data protection concept',
          url: 'https://images.unsplash.com/photo-1526374965328-7f5ae4e8e49b?w=400&h=300&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f5ae4e8e49b?w=200&h=150&fit=crop'
        }
      ]);
      setNewsResults([
        {
          title: 'New Privacy Regulations Impact Search Engines',
          url: 'https://news.org/privacy-regulations',
          description: 'Latest regulations require search engines to improve privacy protections for users.',
          source: 'Privacy News Daily',
          publishedAt: new Date().toISOString()
        },
        {
          title: 'Users Shift to Privacy-Focused Search Options',
          url: 'https://news.org/user-shift',
          description: 'Growing number of internet users switching to privacy-focused search engines for better data protection.',
          source: 'Tech News Weekly',
          publishedAt: new Date(Date.now() - 86400000).toISOString()
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
    const pageResults = getPageResults();
    if (pageResults.length === 0 && webResults.length === 0) {
      return <div className="loading">No results found</div>;
    }

    return pageResults.map((result, index) => (
      <div key={index} className="web-result">
        <div className="web-result-url">{result.domain || (result.url && new URL(result.url).hostname) || 'unknown'}</div>
        <a href={result.url} target="_blank" rel="noopener noreferrer" className="web-result-title">
          {result.title}
        </a>
        <p className="web-result-description">{result.description}</p>
      </div>
    ));
  };

  const renderImageResults = () => {
    if (loading) return <div className="loading">Loading images...</div>;
    const pageResults = getPageResults();
    if (pageResults.length === 0 && imageResults.length === 0) {
      return <div className="loading">No images found</div>;
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {pageResults.map((image, index) => (
          <div key={index} style={{ borderRadius: '8px', overflow: 'hidden' }}>
            <img 
              src={image.thumbnail || image.url} 
              alt={image.title}
              style={{ width: '100%', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
              onClick={() => window.open(image.url, '_blank')}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderNewsResults = () => {
    if (loading) return <div className="loading">Loading news...</div>;
    const pageResults = getPageResults();
    if (pageResults.length === 0 && newsResults.length === 0) {
      return <div className="loading">No news found</div>;
    }

    return pageResults.map((article, index) => (
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
              onClick={() => {
                setActiveTab('web');
                if (onTabChange) onTabChange('web');
              }}
            >
              Web
            </button>
            <button 
              className={`search-tab ${activeTab === 'images' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('images');
                if (onTabChange) onTabChange('images');
              }}
            >
              Images
            </button>
            <button 
              className={`search-tab ${activeTab === 'news' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('news');
                if (onTabChange) onTabChange('news');
              }}
            >
              News
            </button>
          </div>

          <div className="results-content">
            {activeTab === 'web' && renderWebResults()}
            {activeTab === 'images' && renderImageResults()}
            {activeTab === 'news' && renderNewsResults()}
          </div>

          {/* Pagination Controls */}
          {getTotalPages() > 1 && (
            <div style={{
              marginTop: '40px',
              padding: '20px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #0078d4',
                  background: currentPage === 1 ? '#f0f0f0' : '#0078d4',
                  color: currentPage === 1 ? '#999' : '#fff',
                  borderRadius: '4px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                ← Previous
              </button>

              {/* Page number input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ color: '#333', fontSize: '14px' }}>Page:</label>
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value) || 1;
                    setCurrentPage(Math.max(1, Math.min(page, getTotalPages())));
                  }}
                  min="1"
                  max={getTotalPages()}
                  style={{
                    width: '60px',
                    padding: '6px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                <span style={{ color: '#666', fontSize: '14px' }}>
                  of {getTotalPages()}
                </span>
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                disabled={currentPage === getTotalPages()}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #0078d4',
                  background: currentPage === getTotalPages() ? '#f0f0f0' : '#0078d4',
                  color: currentPage === getTotalPages() ? '#999' : '#fff',
                  borderRadius: '4px',
                  cursor: currentPage === getTotalPages() ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Next →
              </button>

              <span style={{ color: '#999', fontSize: '12px', marginLeft: '10px' }}>
                Results per page: {resultsPerPage}
              </span>
            </div>
          )}
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