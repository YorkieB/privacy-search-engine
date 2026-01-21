import React, { useState, useEffect } from 'react';
import SearchForm from './SearchForm.jsx';
import LoadingState from './LoadingState.jsx';
import ErrorMessage from './ErrorMessage.jsx';
import RefreshSettings from './RefreshSettings.jsx';

const NewsSection = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5 * 60 * 1000); // 5 minutes default
  const [refreshTimer, setRefreshTimer] = useState(null);

  // Load positive news on component mount
  useEffect(() => {
    handleSearch('');
  }, []);

  // Handle auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const timer = setInterval(() => {
        handleSearch(lastQuery);
      }, refreshInterval);
      
      setRefreshTimer(timer);
      
      return () => {
        if (timer) clearInterval(timer);
      };
    } else {
      if (refreshTimer) {
        clearInterval(refreshTimer);
        setRefreshTimer(null);
      }
    }
  }, [autoRefresh, refreshInterval, lastQuery]);

  const handleSearch = async (query) => {
    setLoading(true);
    setError(null);
    setLastQuery(query || '');

    try {
      const params = query ? new URLSearchParams({ q: query.trim() }) : '';
      const response = await fetch(`/api/news${params ? `?${params}` : ''}`);
      
      if (!response.ok) {
        throw new Error('News search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError('Failed to fetch positive news. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshSettingsChange = (enabled, interval) => {
    setAutoRefresh(enabled);
    setRefreshInterval(interval);
  };

  const formatScore = (score) => {
    return (score * 100).toFixed(0);
  };

  return (
    <div className="search-section">
      <h2>Positive News</h2>
      
      <RefreshSettings
        autoRefresh={autoRefresh}
        refreshInterval={refreshInterval}
        onChange={handleRefreshSettingsChange}
      />
      
      <SearchForm 
        onSearch={handleSearch}
        loading={loading}
        placeholder="Search for positive news..."
      />

      {loading && <LoadingState message="Finding positive news..." />}
      
      {error && <ErrorMessage message={error} />}
      
      {!loading && !error && results.length === 0 && (
        <div className="no-results">
          No positive news found. Try a different search or wait for auto-refresh.
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="results-container">
          {results.map((result, index) => (
            <div key={index} className="news-result">
              <h4>
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title={result.title}
                >
                  {result.title}
                </a>
              </h4>
              
              {result.snippet && (
                <div className="snippet">{result.snippet}</div>
              )}
              
              <div className="meta">
                <span>
                  {result.source || result.domain}
                  {result.published && ` • ${result.published}`}
                </span>
                
                {result.positivityScore && (
                  <span className="positivity-score">
                    +{formatScore(result.positivityScore)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {autoRefresh && (
        <div style={{ 
          fontSize: '0.8rem', 
          color: '#6c757d', 
          textAlign: 'center', 
          marginTop: '1rem' 
        }}>
          Auto-refreshing every {Math.round(refreshInterval / 60000)} minutes
        </div>
      )}
    </div>
  );
};

export default NewsSection;