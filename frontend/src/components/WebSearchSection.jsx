import React, { useState } from 'react';
import SearchForm from './SearchForm.jsx';
import LoadingState from './LoadingState.jsx';
import ErrorMessage from './ErrorMessage.jsx';

const WebSearchSection = () => {
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
      const response = await fetch(`/api/search?${params}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError('Failed to fetch search results. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-section">
      <h2>Web Search</h2>
      
      <SearchForm 
        onSearch={handleSearch}
        loading={loading}
        placeholder="Search the web..."
      />

      {loading && <LoadingState message="Searching the web..." />}
      
      {error && <ErrorMessage message={error} />}
      
      {!loading && !error && results.length === 0 && lastQuery && (
        <div className="no-results">
          No results found for "{lastQuery}"
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="results-container">
          {results.map((result, index) => (
            <div key={index} className="web-result">
              <h3>
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title={result.title}
                >
                  {result.title}
                </a>
              </h3>
              <div className="snippet">{result.snippet}</div>
              <div className="meta">
                {result.domain} {result.published && `• ${result.published}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WebSearchSection;