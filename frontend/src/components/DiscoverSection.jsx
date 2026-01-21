import React from 'react';

function DiscoverSection() {
  const discoverCards = [
    {
      id: 1,
      title: "Privacy Matters",
      subtitle: "Latest developments in digital privacy",
      image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=500&h=400&fit=crop",
      size: "large"
    },
    {
      id: 2,
      title: "Technology News",
      subtitle: "Breaking tech stories",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop",
      size: "medium"
    },
    {
      id: 3,
      title: "Security Updates",
      subtitle: "Stay protected online",
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=300&h=200&fit=crop",
      size: "medium"
    },
    {
      id: 4,
      title: "Science",
      subtitle: "Latest discoveries",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop",
      size: "medium"
    },
    {
      id: 5,
      title: "Environment",
      subtitle: "Green initiatives",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop",
      size: "medium"
    }
  ];

  return (
    <section className="discover-section">
      <div className="discover-container">
        <h2 className="discover-title">Discover</h2>
        
        <div className="discover-grid">
          {discoverCards.map((card) => (
            <div 
              key={card.id} 
              className={`discover-card ${card.size}`}
              onClick={() => window.open(`/?q=${encodeURIComponent(card.title)}`, '_blank')}
            >
              <img 
                src={card.image} 
                alt={card.title} 
                className="discover-card-image"
              />
              <div className="discover-card-content">
                <h3 className="discover-card-title">{card.title}</h3>
                <p className="discover-card-subtitle">{card.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DiscoverSection;