import React, { useState } from 'react';

function HeroSection({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Privacy Search</h1>
        <p className="hero-subtitle">
          Fast, unbiased search results with no tracking and positive news
        </p>
      </div>
      
      <form className="search-box" onSubmit={handleSubmit}>
        <input
          type="text"
          className="main-search-input"
          placeholder="Search the web privately..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="search-button">
          🔍
        </button>
      </form>
    </section>
  );
}

export default HeroSection;