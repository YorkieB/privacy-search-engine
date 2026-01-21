import React, { useState } from 'react';
import HeroSection from './components/HeroSection.jsx';
import NewsCarousel from './components/NewsCarousel.jsx';
import DiscoverSection from './components/DiscoverSection.jsx';
import SearchResults from './components/SearchResults.jsx';
import Header from './components/Header.jsx';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState('web');

  const handleSearch = (query) => {
    setSearchQuery(query);
    setShowResults(true);
    setActiveTab('web');
  };

  const handleBackToHome = () => {
    setShowResults(false);
    setSearchQuery('');
    setActiveTab('web');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="App">
      <Header 
        onBackToHome={handleBackToHome} 
        showBackButton={showResults}
        onTabChange={handleTabChange}
        activeTab={activeTab}
      />
      
      {!showResults ? (
        <>
          <HeroSection onSearch={handleSearch} />
          <NewsCarousel />
          <DiscoverSection onSearch={handleSearch} />
        </>
      ) : (
        <SearchResults query={searchQuery} onNewSearch={handleSearch} activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
}

export default App;