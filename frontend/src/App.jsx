import React, { useState } from 'react';
import HeroSection from './components/HeroSection.jsx';
import NewsCarousel from './components/NewsCarousel.jsx';
import DiscoverSection from './components/DiscoverSection.jsx';
import SearchResults from './components/SearchResults.jsx';
import Header from './components/Header.jsx';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setShowResults(true);
  };

  const handleBackToHome = () => {
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <div className="App">
      <Header onBackToHome={handleBackToHome} showBackButton={showResults} />
      
      {!showResults ? (
        <>
          <HeroSection onSearch={handleSearch} />
          <NewsCarousel />
          <DiscoverSection onSearch={handleSearch} />
        </>
      ) : (
        <SearchResults query={searchQuery} onNewSearch={handleSearch} />
      )}
    </div>
  );
}

export default App;