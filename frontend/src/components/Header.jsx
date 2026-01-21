import React from 'react';

function Header({ onBackToHome, showBackButton, onTabChange, activeTab }) {
  const handleNavClick = (e, tab) => {
    e.preventDefault();
    if (showBackButton && onTabChange) {
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
              onClick={(e) => handleNavClick(e, 'web')}
              className={`nav-link ${activeTab === 'web' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            >
              Web
            </button>
            <button 
              onClick={(e) => handleNavClick(e, 'images')}
              className={`nav-link ${activeTab === 'images' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            >
              Images
            </button>
            <button 
              onClick={(e) => handleNavClick(e, 'news')}
              className={`nav-link ${activeTab === 'news' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
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