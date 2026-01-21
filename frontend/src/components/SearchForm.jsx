import React, { useState } from 'react';

const SearchForm = ({ onSearch, loading, placeholder = "Search..." }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="search-form" role="search">
      <label htmlFor={`search-${Date.now()}`} className="visually-hidden">
        {placeholder}
      </label>
      <input
        id={`search-${Date.now()}`}
        type="search"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="search-input"
        disabled={loading}
        autoComplete="off"
        spellCheck="false"
      />
      <button
        type="submit"
        className="search-button"
        disabled={loading || !query.trim()}
      >
        {loading ? (
          <>
            <span className="loading-spinner"></span>
            Searching...
          </>
        ) : (
          'Search'
        )}
      </button>
    </form>
  );
};

export default SearchForm;