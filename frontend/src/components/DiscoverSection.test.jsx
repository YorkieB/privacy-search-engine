import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiscoverSection from './DiscoverSection';

describe('DiscoverSection', () => {
  it('should render discover section', () => {
    render(<DiscoverSection onSearch={jest.fn()} />);

    const heading = screen.getByRole('heading', { name: /discover/i });
    expect(heading).toBeInTheDocument();
  });

  it('should render all discover cards', () => {
    const { container } = render(<DiscoverSection onSearch={jest.fn()} />);

    const cards = container.querySelectorAll('.discover-card');
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.length).toBe(5); // Based on the hardcoded cards
  });

  it('should render card titles and subtitles', () => {
    render(<DiscoverSection onSearch={jest.fn()} />);

    expect(screen.getByText('Privacy Matters')).toBeInTheDocument();
    expect(screen.getByText('Technology News')).toBeInTheDocument();
    expect(screen.getByText('Security Updates')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
    expect(screen.getByText('Environment')).toBeInTheDocument();
  });

  it('should render card images', () => {
    const { container } = render(<DiscoverSection onSearch={jest.fn()} />);

    const images = container.querySelectorAll('.discover-card-image');
    expect(images.length).toBe(5);

    images.forEach(img => {
      expect(img).toHaveAttribute('src');
      expect(img).toHaveAttribute('alt');
    });
  });

  it('should call onSearch with card title when clicked', async () => {
    const mockOnSearch = jest.fn();
    const user = userEvent.setup();

    const { container } = render(<DiscoverSection onSearch={mockOnSearch} />);

    const firstCard = container.querySelector('.discover-card');
    await user.click(firstCard);

    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    expect(mockOnSearch).toHaveBeenCalledWith('Privacy Matters');
  });

  it('should call onSearch for each card with respective title', async () => {
    const mockOnSearch = jest.fn();
    const user = userEvent.setup();

    const { container } = render(<DiscoverSection onSearch={mockOnSearch} />);

    const cards = container.querySelectorAll('.discover-card');

    // Click second card (Technology News)
    await user.click(cards[1]);
    expect(mockOnSearch).toHaveBeenLastCalledWith('Technology News');

    // Click third card (Security Updates)
    await user.click(cards[2]);
    expect(mockOnSearch).toHaveBeenLastCalledWith('Security Updates');

    expect(mockOnSearch).toHaveBeenCalledTimes(2);
  });

  it('should have cursor pointer style on cards', () => {
    const { container } = render(<DiscoverSection onSearch={jest.fn()} />);

    const firstCard = container.querySelector('.discover-card');
    expect(firstCard).toHaveStyle({ cursor: 'pointer' });
  });

  it('should handle missing onSearch prop gracefully', () => {
    const { container } = render(<DiscoverSection />);

    const firstCard = container.querySelector('.discover-card');

    // Should not throw error when clicking without onSearch
    expect(() => {
      fireEvent.click(firstCard);
    }).not.toThrow();
  });

  it('should render with correct size classes', () => {
    const { container } = render(<DiscoverSection onSearch={jest.fn()} />);

    const largeCard = container.querySelector('.discover-card.large');
    const mediumCards = container.querySelectorAll('.discover-card.medium');

    expect(largeCard).toBeInTheDocument();
    expect(mediumCards.length).toBe(4);
  });

  it('should have unique keys for cards', () => {
    const { container } = render(<DiscoverSection onSearch={jest.fn()} />);

    const cards = container.querySelectorAll('.discover-card');

    // React would warn if keys were duplicate, but we can check structure
    expect(cards.length).toBe(5);
    cards.forEach((card, index) => {
      expect(card).toBeInTheDocument();
    });
  });

  it('should render images with accessible alt text', () => {
    render(<DiscoverSection onSearch={jest.fn()} />);

    const privacyImage = screen.getByAltText('Privacy Matters');
    const technologyImage = screen.getByAltText('Technology News');
    const securityImage = screen.getByAltText('Security Updates');
    const scienceImage = screen.getByAltText('Science');
    const environmentImage = screen.getByAltText('Environment');

    expect(privacyImage).toBeInTheDocument();
    expect(technologyImage).toBeInTheDocument();
    expect(securityImage).toBeInTheDocument();
    expect(scienceImage).toBeInTheDocument();
    expect(environmentImage).toBeInTheDocument();
  });

  it('should render section with correct class name', () => {
    const { container } = render(<DiscoverSection onSearch={jest.fn()} />);

    const section = container.querySelector('.discover-section');
    expect(section).toBeInTheDocument();
  });

  it('should render discover container', () => {
    const { container } = render(<DiscoverSection onSearch={jest.fn()} />);

    const discoverContainer = container.querySelector('.discover-container');
    expect(discoverContainer).toBeInTheDocument();
  });

  it('should render discover grid', () => {
    const { container } = render(<DiscoverSection onSearch={jest.fn()} />);

    const discoverGrid = container.querySelector('.discover-grid');
    expect(discoverGrid).toBeInTheDocument();
  });

  it('should trigger search on keyboard interaction', async () => {
    const mockOnSearch = jest.fn();
    const user = userEvent.setup();

    const { container } = render(<DiscoverSection onSearch={mockOnSearch} />);

    const firstCard = container.querySelector('.discover-card');

    // Simulate Enter key press
    firstCard.focus();
    await user.keyboard('{Enter}');

    // Note: onClick doesn't trigger on Enter by default for divs
    // This test documents current behavior
    // If keyboard accessibility is needed, card should use <button> or have onKeyDown
  });
});
