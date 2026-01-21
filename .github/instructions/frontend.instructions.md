
# Frontend Guidelines

## Structure & Framework
- The frontend is a **single-page application** that provides a search interface and displays results. It can be a simple static page or built with a framework like **React** for more interactivity.
- Organise the code into components for clarity:
  - For React: create small, reusable components (SearchBar, ResultsList, ResultItem, etc.) in a `components/` directory.
  - Keep layout components (header, footer) separate from functional components (search form, results listing).
  - Use a state management approach that fits the scope (React’s built-in state and Context API should suffice; avoid adding heavy libraries unless needed).
- Ensure all assets (images, icons, styles) are properly managed:
  - Store images, icons, and other assets in a `frontend/assets/` (or similar) folder. Optimise images for web (compressed size, appropriate formats).
  - Use a favicon and, if applicable, a manifest for PWA.
- If not using a framework, structure your JS in modules or namespaces to avoid polluting global scope. Even in vanilla JS, separate concerns (e.g., DOM manipulation vs network calls).

## UI/UX Design Principles
- **Simplicity**: The homepage should be clean and focused on the search bar. Only essential elements (search box, submit button, perhaps a logo and minimal navigation) should be present.
- **Responsive Design**: Use CSS Flexbox/Grid and media queries for responsiveness. The layout should adapt to small screens (stack elements, full-width inputs) and larger screens (centring content, maybe two-column layouts if needed).
- **Accessibility**:
  - Use semantic HTML. Wrap the search input in a `<form role="search">` with a `<label>` (visually hidden if necessary) for the input.
  - Ensure keyboard usability: the user should be able to tab to the search field, hit Enter to search, and tab through any results or links.
  - Provide high-contrast and legible text. Use alt attributes on images (like logo).
  - If dynamic content (like suggestions or error messages) is added, use `aria-live` regions to announce them if appropriate.
- **Feedback & Loading**:
  - Give the user visual feedback when a search is happening (e.g., a loading spinner or a "Searching..." message).
  - If no results are found, display a friendly message ("No results for X").
  - If an error occurs (network down, etc.), inform the user with a brief message and perhaps allow retry.
- **State Management in UI**:
  - Keep the state (search query, results, loading status) in as few places as necessary (e.g., top-level App or context).
  - Reset or update state appropriately (e.g., clear old results when a new search starts).
- **Navigation**:
  - If implementing multiple pages (maybe a separate settings page), use a routing library (React Router) or simple conditionals to show/hide sections.
  - Ensure the browser back/forward works (especially if using client routing or pushing state for search queries).

## Preferred Frontend Practices & Libraries
- **HTTP Requests**: Use the built-in Fetch API or a library like Axios to call the backend. Encapsulate calls in a function or custom hook (e.g., `useSearchResults(query)`).
- **UI Components**: Use minimal dependencies. E.g., use your own components or light libraries instead of something huge like jQuery UI.
- **Styling**: Choose a strategy (pure CSS, CSS modules, styled-components, Tailwind). Maintain consistency:
  - If using plain CSS, organise it (maybe a main.css plus component-specific CSS files).
  - If using Tailwind, maintain a config and use classes consistently.
- **State**: For global state (if needed, e.g., user preferences), React Context or a small store (Zustand, etc.) is preferable to adding Redux boilerplate for a simple app.
- **Testing**: Use @testing-library/react for component tests. Test crucial interactions (form submission triggers search function, result list renders given props, etc.).

## Security & Performance on Frontend
- **Sanitize Content**: If any HTML comes from backend or external sources, sanitize or escape it. The default should be treating all data as text unless explicitly safe.
- **Avoid Heavy Operations**: Don’t block the UI thread unnecessarily. Use web workers for any potentially heavy processing (likely not needed here).
- **Caching**: The browser will cache XHR/fetch responses if HTTP headers allow. We can also cache results in memory on the client (e.g., keep last results to avoid flicker if user searches same term twice).
- **Throttling**: If implementing features like infinite scroll or live search suggestions, throttle or debounce the calls to avoid spamming backend.

## Example Snippets
- *Search Form example (JSX)*:
  ```jsx
  <form onSubmit={handleSearch} role="search" aria-label="Site Search">
    <label htmlFor="search-input" className="visually-hidden">Search the site</label>
    <input 
      id="search-input" 
      type="search" 
      value={query} 
      onChange={e => setQuery(e.target.value)} 
      placeholder="Search..." 
      required 
    />
    <button type="submit">Search</button>
  </form>
  ```
  This form is accessible and will call `handleSearch` on submit.
- *Result Item example*:
  ```jsx
  function ResultItem({ title, url, snippet }) {
    return (
      <div className="result-item">
        <h3><a href={url} target="_blank" rel="noopener noreferrer">{title}</a></h3>
        <p>{snippet}</p>
      </div>
    );
  }
  ```
  Each result opens in a new tab with rel=noopener for security.

## Consistency and Copilot
- Use the same design patterns throughout (e.g., all form controls styled similarly).
- All Copilot-suggested code for the frontend should follow these principles: semantic HTML, responsive CSS, accessible interactions.
- By adhering to this, Copilot will generate UI code that requires minimal refactoring and is aligned with a user-friendly, consistent design.
