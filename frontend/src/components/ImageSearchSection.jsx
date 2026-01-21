import React, { useState } from 'react';
import SearchForm from './SearchForm.jsx';
import LoadingState from './LoadingState.jsx';
import ErrorMessage from './ErrorMessage.jsx';

const ImageSearchSection = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState('');

  const handleSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setLastQuery(query);

    try {
      const params = new URLSearchParams({ q: query.trim() });
      const response = await fetch(`/api/images?${params}`);
      
      if (!response.ok) {
        throw new Error('Image search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError('Failed to fetch image results. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  return (
    <div className="search-section">
      <h2>Image Search</h2>
      
      <SearchForm 
        onSearch={handleSearch}
        loading={loading}
        placeholder="Search for images..."
      />

      {loading && <LoadingState message="Finding images..." />}
      
      {error && <ErrorMessage message={error} />}
      
      {!loading && !error && results.length === 0 && lastQuery && (
        <div className="no-results">
          No images found for "{lastQuery}"
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="results-container">
          <div className="image-grid">
            {results.map((result, index) => (
              <div key={index} className="image-result">
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title={result.title}
                >
                  <img 
                    src={result.thumbnail} 
                    alt={result.title}
                    onError={handleImageError}
                    loading="lazy"
                  />
                  <div className="image-info">
                    <div className="image-title" title={result.title}>
                      {result.title}
                    </div>
                    {result.domain && (
                      <div className="image-source">
                        {result.domain}
                      </div>
                    )}
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSearchSection;