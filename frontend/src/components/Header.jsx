import React from 'react';

function Header({ onBackToHome, showBackButton }) {
  return (
    <header className="header">
      <div className="header-left">
        {showBackButton && (
          <button className="back-button" onClick={onBackToHome}>
            ← Home
          </button>
        )}
        <a href="#" className="logo" onClick={onBackToHome}>
          Privacy Search
        </a>
        <nav className="nav-links">
          <a href="#" className="nav-link">Images</a>
          <a href="#" className="nav-link">Videos</a>
          <a href="#" className="nav-link">News</a>
          <a href="#" className="nav-link">Maps</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;