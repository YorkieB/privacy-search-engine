# Testing Guide

This document provides information about the test suite for the Privacy Search Engine project.

## Overview

The project includes comprehensive test coverage for both backend and frontend components:

- **Backend Tests**: Unit tests for services, controllers, and utilities
- **Frontend Tests**: Component tests for React components

## Test Framework

- **Testing Framework**: Jest
- **React Testing**: React Testing Library
- **Assertions**: jest-dom matchers

## Running Tests

### Backend Tests

```bash
cd backend
npm install  # Install dependencies if not already done
npm test
```

Run specific test file:
```bash
npm test search/news-filter.test.js
```

Run with coverage:
```bash
npm run test:coverage
```

Watch mode:
```bash
npm run test:watch
```

### Frontend Tests

```bash
cd frontend
npm install  # Install dependencies if not already done
npm test
```

Run specific test file:
```bash
npm test SearchForm.test.jsx
```

Run with coverage:
```bash
npm run test:coverage
```

Watch mode:
```bash
npm run test:watch
```

### Run All Tests

From the project root:
```bash
# Backend tests
(cd backend && npm test)

# Frontend tests
(cd frontend && npm test)
```

## Test Files

### Backend Tests

1. **`backend/search/news-filter.test.js`**
   - Tests sentiment analysis functionality
   - Keyword boosting and filtering
   - Content diversity algorithms
   - Positive news filtering

2. **`backend/search/cache.test.js`**
   - LRU cache implementation
   - TTL expiration
   - Key generation
   - Cache statistics

3. **`backend/controllers/search-controller.test.js`**
   - API endpoint handlers
   - Request validation
   - Error handling
   - Cache integration

### Frontend Tests

1. **`frontend/src/components/SearchForm.test.jsx`**
   - Form submission
   - Input validation
   - Loading states
   - Accessibility (useId hook, labels)

2. **`frontend/src/components/DiscoverSection.test.jsx`**
   - Card rendering
   - Click handlers
   - Navigation integration

3. **`frontend/src/components/SearchResults.test.jsx`**
   - Data fetching with AbortController
   - Tab switching
   - Pagination
   - Error handling
   - URL parsing safety
   - Snippet vs description field handling

## Test Coverage

To view test coverage reports:

### Backend Coverage
```bash
cd backend
npm run test:coverage
```

Coverage report will be available in `backend/coverage/lcov-report/index.html`

### Frontend Coverage
```bash
cd frontend
npm run test:coverage
```

Coverage report will be available in `frontend/coverage/lcov-report/index.html`

## Key Testing Patterns

### Backend

**Mocking Dependencies**:
```javascript
jest.mock('../search/brave-service.js', () => ({
  default: {
    searchWeb: jest.fn()
  }
}));
```

**Testing Async Functions**:
```javascript
it('should fetch results', async () => {
  const results = await NewsFilterService.filterPositiveNews(articles);
  expect(results).toBeDefined();
});
```

### Frontend

**Testing User Interactions**:
```javascript
import userEvent from '@testing-library/user-event';

it('should call onSearch when form is submitted', async () => {
  const user = userEvent.setup();
  await user.type(input, 'test query');
  await user.click(button);
  expect(mockOnSearch).toHaveBeenCalled();
});
```

**Testing Async Components**:
```javascript
import { waitFor } from '@testing-library/react';

it('should display results', async () => {
  render(<SearchResults query="test" />);
  await waitFor(() => {
    expect(screen.getByText('Result 1')).toBeInTheDocument();
  });
});
```

**Mocking fetch**:
```javascript
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ results: [] })
  })
);
```

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Backend Tests
  run: cd backend && npm ci && npm test

- name: Run Frontend Tests
  run: cd frontend && npm ci && npm test
```

## Troubleshooting

### Common Issues

**"jest: not found"**
- Solution: Run `npm install` in the backend/frontend directory to install devDependencies

**"Cannot find module '@testing-library/react'"**
- Solution: Run `npm install` in the frontend directory

**Tests timing out**
- Solution: Increase Jest timeout with `jest.setTimeout(10000)` or use `--testTimeout=10000` flag

**Mock not working**
- Solution: Ensure mocks are defined before importing the module under test

## Writing New Tests

### Backend Test Template

```javascript
import ServiceUnderTest from './service.js';

jest.mock('./dependency.js', () => ({
  default: {
    method: jest.fn()
  }
}));

describe('ServiceUnderTest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should do something', async () => {
    // Arrange
    const input = 'test';

    // Act
    const result = await ServiceUnderTest.method(input);

    // Assert
    expect(result).toBeDefined();
  });
});
```

### Frontend Component Test Template

```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComponentUnderTest from './ComponentUnderTest';

describe('ComponentUnderTest', () => {
  it('should render correctly', () => {
    render(<ComponentUnderTest prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const mockHandler = jest.fn();
    const user = userEvent.setup();

    render(<ComponentUnderTest onClick={mockHandler} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockHandler).toHaveBeenCalled();
  });
});
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component/function does, not how it does it
2. **Use Descriptive Test Names**: Test names should clearly describe what is being tested
3. **Arrange-Act-Assert Pattern**: Structure tests with clear setup, execution, and verification phases
4. **Mock External Dependencies**: Isolate the unit under test from external services
5. **Test Edge Cases**: Include tests for error conditions, empty inputs, and boundary values
6. **Keep Tests Fast**: Avoid unnecessary delays and timeouts
7. **One Assertion Per Test**: When possible, test one thing at a time for clarity

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new features:

1. Write tests alongside your code
2. Ensure all existing tests still pass
3. Aim for at least 80% code coverage
4. Update this documentation if adding new test patterns

## Test Coverage Goals

- **Backend**: Minimum 80% coverage
- **Frontend**: Minimum 75% coverage
- **Critical Paths**: 100% coverage (authentication, payment, etc.)

Run `npm run test:coverage` regularly to track progress towards these goals.
