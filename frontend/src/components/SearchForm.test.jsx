import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchForm from './SearchForm';

describe('SearchForm', () => {
  it('should render search input and button', () => {
    const mockOnSearch = jest.fn();

    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByRole('searchbox');
    const button = screen.getByRole('button', { name: /search/i });

    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    const mockOnSearch = jest.fn();
    const placeholder = 'Search for anything...';

    render(<SearchForm onSearch={mockOnSearch} placeholder={placeholder} />);

    const input = screen.getByPlaceholderText(placeholder);
    expect(input).toBeInTheDocument();
  });

  it('should use default placeholder when not provided', () => {
    const mockOnSearch = jest.fn();

    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search...');
    expect(input).toBeInTheDocument();
  });

  it('should call onSearch when form is submitted', async () => {
    const mockOnSearch = jest.fn();
    const user = userEvent.setup();

    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByRole('searchbox');
    const button = screen.getByRole('button', { name: /search/i });

    await user.type(input, 'test query');
    await user.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('test query');
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it('should call onSearch when pressing Enter', async () => {
    const mockOnSearch = jest.fn();
    const user = userEvent.setup();

    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByRole('searchbox');

    await user.type(input, 'test query{Enter}');

    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('should update input value as user types', async () => {
    const mockOnSearch = jest.fn();
    const user = userEvent.setup();

    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByRole('searchbox');

    await user.type(input, 'hello');

    expect(input).toHaveValue('hello');
  });

  it('should disable input and button when loading', () => {
    const mockOnSearch = jest.fn();

    render(<SearchForm onSearch={mockOnSearch} loading={true} />);

    const input = screen.getByRole('searchbox');
    const button = screen.getByRole('button');

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('should show loading state on button', () => {
    const mockOnSearch = jest.fn();

    render(<SearchForm onSearch={mockOnSearch} loading={true} />);

    const button = screen.getByRole('button');

    expect(button).toHaveTextContent(/searching/i);
    expect(button).toBeDisabled();
  });

  it('should disable button when query is empty', async () => {
    const mockOnSearch = jest.fn();

    render(<SearchForm onSearch={mockOnSearch} />);

    const button = screen.getByRole('button', { name: /search/i });

    expect(button).toBeDisabled();
  });

  it('should disable button when query is only whitespace', async () => {
    const mockOnSearch = jest.fn();
    const user = userEvent.setup();

    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByRole('searchbox');
    const button = screen.getByRole('button');

    await user.type(input, '   ');

    expect(button).toBeDisabled();
  });

  it('should enable button when query has content', async () => {
    const mockOnSearch = jest.fn();
    const user = userEvent.setup();

    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByRole('searchbox');
    const button = screen.getByRole('button');

    await user.type(input, 'test');

    expect(button).not.toBeDisabled();
  });

  it('should have accessible label for screen readers', () => {
    const mockOnSearch = jest.fn();
    const placeholder = 'Search...';

    render(<SearchForm onSearch={mockOnSearch} placeholder={placeholder} />);

    const input = screen.getByRole('searchbox');

    // Check that input has a label (even if visually hidden)
    expect(input).toHaveAccessibleName(placeholder);
  });

  it('should have role="search" on form', () => {
    const mockOnSearch = jest.fn();

    const { container } = render(<SearchForm onSearch={mockOnSearch} />);

    const form = container.querySelector('form');
    expect(form).toHaveAttribute('role', 'search');
  });

  it('should have autocomplete off', () => {
    const mockOnSearch = jest.fn();

    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('autocomplete', 'off');
  });

  it('should have spellcheck disabled', () => {
    const mockOnSearch = jest.fn();

    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('spellcheck', 'false');
  });

  it('should use unique ID from useId hook', () => {
    const mockOnSearch = jest.fn();

    const { container } = render(<SearchForm onSearch={mockOnSearch} />);

    const label = container.querySelector('label');
    const input = screen.getByRole('searchbox');

    expect(label).toHaveAttribute('for');
    expect(input).toHaveAttribute('id');
    expect(label.getAttribute('for')).toBe(input.getAttribute('id'));
  });

  it('should not submit empty form', async () => {
    const mockOnSearch = jest.fn();
    const user = userEvent.setup();

    render(<SearchForm onSearch={mockOnSearch} />);

    const form = screen.getByRole('search');

    fireEvent.submit(form);

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('should clear input after submission (if needed)', async () => {
    const mockOnSearch = jest.fn();
    const user = userEvent.setup();

    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByRole('searchbox');

    await user.type(input, 'test query{Enter}');

    // Input maintains value after submit (current behavior)
    expect(input).toHaveValue('test query');
  });
});
