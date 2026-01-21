import React from 'react';

function Header({ onBackToHome, showBackButton, onTabChange, activeTab }) {
  const handleNavClick = (tab) => {
    console.log('Nav clicked:', tab, 'activeTab:', activeTab, 'showBackButton:', showBackButton);
    if (showBackButton && onTabChange) {
      console.log('Calling onTabChange with:', tab);
      onTabChange(tab);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        {showBackButton && (
          <button className="back-button" onClick={onBackToHome}>
            ← Home
          </button>
        )}
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); onBackToHome(); }}>
          Privacy Search
        </a>
        {showBackButton ? (
          <nav className="nav-links">
            <button 
              onClick={() => handleNavClick('web')}
              className={`nav-link ${activeTab === 'web' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Web
            </button>
            <button 
              onClick={() => handleNavClick('images')}
              className={`nav-link ${activeTab === 'images' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Images
            </button>
            <button 
              onClick={() => handleNavClick('news')}
              className={`nav-link ${activeTab === 'news' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              News
            </button>
          </nav>
        ) : (
          <nav className="nav-links">
            <a href="#" className="nav-link">Images</a>
            <a href="#" className="nav-link">Videos</a>
            <a href="#" className="nav-link">News</a>
            <a href="#" className="nav-link">Maps</a>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;