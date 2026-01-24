import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchResults from './SearchResults';

// Mock fetch
global.fetch = jest.fn();

describe('SearchResults', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  const mockWebResults = {
    results: [
      {
        title: 'Test Result 1',
        url: 'https://example.com/1',
        snippet: 'This is test snippet 1',
        domain: 'example.com'
      },
      {
        title: 'Test Result 2',
        url: 'https://example.com/2',
        snippet: 'This is test snippet 2',
        domain: 'example.com'
      }
    ]
  };

  const mockImageResults = {
    results: [
      {
        title: 'Image 1',
        url: 'https://example.com/image1.jpg',
        thumbnail: 'https://example.com/thumb1.jpg'
      }
    ]
  };

  const mockNewsResults = {
    results: [
      {
        title: 'News Article 1',
        url: 'https://example.com/news1',
        snippet: 'News snippet 1',
        source: 'News Source'
      }
    ]
  };

  it('should render loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<SearchResults query="test" onNewSearch={jest.fn()} />);

    expect(screen.getByText(/searching/i)).toBeInTheDocument();
  });

  it('should fetch all three types of results', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/search')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockWebResults),
          ok: true,
          status: 200
        });
      }
      if (url.includes('/api/images')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockImageResults),
          ok: true,
          status: 200
        });
      }
      if (url.includes('/api/news')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockNewsResults),
          ok: true,
          status: 200
        });
      }
    });

    render(<SearchResults query="test" onNewSearch={jest.fn()} />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/search?q=test'),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/images?q=test'),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/news?q=test'),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('should display web results', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/search')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockWebResults),
          ok: true,
          status: 200
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ results: [] }),
        ok: true,
        status: 200
      });
    });

    render(<SearchResults query="test" onNewSearch={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Test Result 1')).toBeInTheDocument();
      expect(screen.getByText('Test Result 2')).toBeInTheDocument();
    });
  });

  it('should switch between tabs', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/search')) return Promise.resolve({ json: () => Promise.resolve(mockWebResults), ok: true, status: 200 });
      if (url.includes('/api/images')) return Promise.resolve({ json: () => Promise.resolve(mockImageResults), ok: true, status: 200 });
      if (url.includes('/api/news')) return Promise.resolve({ json: () => Promise.resolve(mockNewsResults), ok: true, status: 200 });
    });

    const user = userEvent.setup();
    render(<SearchResults query="test" onNewSearch={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Test Result 1')).toBeInTheDocument();
    });

    // Click Images tab
    const imagesTab = screen.getByRole('button', { name: /images/i });
    await user.click(imagesTab);

    await waitFor(() => {
      expect(imagesTab).toHaveClass('active');
    });

    // Click News tab
    const newsTab = screen.getByRole('button', { name: /news/i });
    await user.click(newsTab);

    await waitFor(() => {
      expect(newsTab).toHaveClass('active');
    });
  });

  it('should abort previous requests when new search is triggered', async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort');

    fetch.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({
        json: () => Promise.resolve(mockWebResults),
        ok: true,
        status: 200
      }), 100);
    }));

    const { rerender } = render(<SearchResults query="first query" onNewSearch={jest.fn()} />);

    // Trigger new search before first completes
    rerender(<SearchResults query="second query" onNewSearch={jest.fn()} />);

    await waitFor(() => {
      expect(abortSpy).toHaveBeenCalled();
    });

    abortSpy.mockRestore();
  });

  it('should handle fetch errors gracefully', async () => {
    fetch.mockRejectedValue(new Error('Network error'));

    render(<SearchResults query="test" onNewSearch={jest.fn()} />);

    // Should not crash and should show fallback data
    await waitFor(() => {
      // Component shows mock data on error
      expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
    });
  });

  it('should handle AbortError without logging', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log');

    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';

    fetch.mockRejectedValue(abortError);

    render(<SearchResults query="test" onNewSearch={jest.fn()} />);

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('Search request was cancelled');
    });

    consoleLogSpy.mockRestore();
  });

  it('should use snippet field with description fallback', async () => {
    const resultsWithSnippet = {
      results: [
        {
          title: 'Result with snippet',
          url: 'https://example.com',
          snippet: 'This is the snippet',
          domain: 'example.com'
        }
      ]
    };

    fetch.mockImplementation((url) => {
      if (url.includes('/api/search')) {
        return Promise.resolve({
          json: () => Promise.resolve(resultsWithSnippet),
          ok: true,
          status: 200
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ results: [] }),
        ok: true,
        status: 200
      });
    });

    render(<SearchResults query="test" onNewSearch={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('This is the snippet')).toBeInTheDocument();
    });
  });

  it('should handle malformed URLs without crashing', async () => {
    const resultsWithBadURL = {
      results: [
        {
          title: 'Result with bad URL',
          url: 'not-a-valid-url',
          snippet: 'Test snippet',
          domain: ''
        }
      ]
    };

    fetch.mockImplementation((url) => {
      if (url.includes('/api/search')) {
        return Promise.resolve({
          json: () => Promise.resolve(resultsWithBadURL),
          ok: true,
          status: 200
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ results: [] }),
        ok: true,
        status: 200
      });
    });

    render(<SearchResults query="test" onNewSearch={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Result with bad URL')).toBeInTheDocument();
    });

    // Should show 'unknown' for malformed URL
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });

  it('should render pagination controls when results exceed page size', async () => {
    const manyResults = {
      results: Array(25).fill(null).map((_, i) => ({
        title: `Result ${i + 1}`,
        url: `https://example.com/${i}`,
        snippet: `Snippet ${i + 1}`,
        domain: 'example.com'
      }))
    };

    fetch.mockImplementation((url) => {
      if (url.includes('/api/search')) {
        return Promise.resolve({
          json: () => Promise.resolve(manyResults),
          ok: true,
          status: 200
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ results: [] }),
        ok: true,
        status: 200
      });
    });

    render(<SearchResults query="test" onNewSearch={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Result 1')).toBeInTheDocument();
    });

    // Check for pagination controls
    expect(screen.getByText('Next →')).toBeInTheDocument();
    expect(screen.getByText('← Previous')).toBeInTheDocument();
  });

  it('should call onTabChange when tab is switched', async () => {
    const mockOnTabChange = jest.fn();
    const user = userEvent.setup();

    fetch.mockResolvedValue({
      json: () => Promise.resolve({ results: [] }),
      ok: true,
      status: 200
    });

    render(<SearchResults query="test" onNewSearch={jest.fn()} onTabChange={mockOnTabChange} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /images/i })).toBeInTheDocument();
    });

    const imagesTab = screen.getByRole('button', { name: /images/i });
    await user.click(imagesTab);

    expect(mockOnTabChange).toHaveBeenCalledWith('images');
  });

  it('should cleanup abort controller on unmount', () => {
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort');

    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { unmount } = render(<SearchResults query="test" onNewSearch={jest.fn()} />);

    unmount();

    expect(abortSpy).toHaveBeenCalled();
    abortSpy.mockRestore();
  });
});
