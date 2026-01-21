# Create a New UI Component

**Goal:** Build a new reusable UI component for the frontend of the Brave search engine project.

**Instructions:**
1. **Determine Component Scope**: Identify what this component is for. Examples:
   - A **SearchSuggestions** dropdown list that shows autocompletion or history.
   - A **SettingsModal** for toggling options (like safe search on/off).
   - A **ResultCard** to display search results in a more detailed card format.
2. **Component File**: Create a file under `frontend/components/` (or the appropriate location) with a clear name, e.g., `SearchSuggestions.jsx`.
3. **Component Implementation**:
   - Use a functional component (if React).
   - Define props that it needs. E.g., `SearchSuggestions` might need `suggestions` (array of strings) and `onSelect` (function to call when a suggestion is chosen).
   - Write the JSX structure:
     - For suggestions: maybe an outer `<ul>` and an `<li>` for each suggestion, styled appropriately.
     - For a modal: a backdrop `<div>`, and a content `<div>` positioned center, etc.
   - Add event handlers:
     - For suggestions, an `onClick` on each suggestion to call `onSelect(suggestion)`.
     - For a modal, a close button that calls an `onClose` prop.
   - Ensure accessibility:
     - e.g., for suggestions list, use `role="listbox"` on `<ul>` and `role="option"` on `<li>`, and manage keyboard events (arrow down/up to navigate, enter to select) if implementing keyboard support.
     - for a modal, trap focus within it and restore focus on close.
4. **Styling**:
   - Write CSS or use styled-components/Tailwind as per project style.
   - Keep styles in line with existing design (colors, font, spacing).
   - Consider responsive behavior if necessary (most small components are naturally responsive, but e.g., a modal should maybe be full-screen on mobile vs fixed-size on desktop).
5. **Integrate into App**:
   - Import the new component where it's needed. For example, use `<SearchSuggestions suggestions={list} onSelect={handleSuggestionSelect} />` inside the SearchBar component, and conditionally render it when `list` is non-empty.
   - Make sure to manage the state driving it (e.g., suggestions list, and maybe a boolean to show/hide).
   - Pass down necessary props/functions.
6. **Testing**:
   - Manually test the component in the browser: does it appear as expected? Are interactions working (clicking suggestion populates search input, etc.)?
   - Write unit tests:
     - Render the component with sample props and simulate user interactions (using React Testing Library, simulate click or keypress).
     - Assert that the component calls the callbacks or updates the UI accordingly.
   - If possible, write an integration test in the context of the whole app (for example, trigger a suggestion scenario and ensure it behaves end-to-end).
7. **Document Usage**:
   - Add a comment at the top of the component file explaining its purpose and expected props.
   - If the component is meant to be reused, consider adding it to any storybook or styleguide if the project has one.
   - Ensure other devs (or Copilot in future) can see from examples how to use it (perhaps by how you integrate it in the app).

**Example:** *Implementing a SearchSuggestions component.*
- Props: `suggestions` (array of strings), `onSelect` (function).
- JSX:
  ```jsx
  function SearchSuggestions({ suggestions, onSelect }) {
    if (!suggestions.length) return null;
    return (
      <ul className="suggestions-dropdown" role="listbox">
        {suggestions.map((s, idx) => (
          <li 
            key={idx} 
            role="option" 
            onMouseDown={() => onSelect(s)} 
            className="suggestion-item"
          >
            {s}
          </li>
        ))}
      </ul>
    );
  }
  ```
- Integration: Used within SearchBar, e.g.:
  ```jsx
  <SearchSuggestions suggestions={autoCompleteList} onSelect={(term) => {
    setQuery(term);
    setAutoCompleteList([]);
    performSearch(term);
  }} />
  ```
- The CSS `.suggestions-dropdown` might have absolute positioning under the search input, a border, background, etc., and `.suggestion-item` highlights on hover.
- Testing: Simulate `onMouseDown` (since using onMouseDown to avoid losing focus before click registers) and ensure `onSelect` is called with correct term.

Following these guidelines ensures the new component is well-structured, maintainable, and fit into the app's architecture. Copilot using these instructions will generate component code that is likely to integrate smoothly without major fixes.
