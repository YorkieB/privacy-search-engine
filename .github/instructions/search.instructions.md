# Search Core Logic Guidelines

*(Guidance on the internal search handling, caching, and any special logic in the `search/` module.)*

## Indexing Strategy
- **Rely on Brave**: Use Brave’s search results as the primary data source. We are not crawling or indexing the whole web ourselves. This keeps complexity low and respects privacy.
- **Supplementary Index**: If the project includes a small custom dataset (e.g., a list of favourite sites or local docs to search):
  - Use a small index for that (perhaps via Lunr or a simple keyword match).
  - This index should be built at runtime or on demand, not a heavy offline process.
  - Keep it separate from web results (maybe user toggles including it or not).
- **No Heavy Processing**: Avoid complex text processing or ML ranking in our logic; delegate heavy lifting to Brave. Our code should mostly orchestrate data from Brave and any small local set.

## Result Ranking & Merging
- **Brave Results**: Preserve the order of Brave’s results as they come (they are likely ranked by relevance already).
- **Merging**:
  - If combining Brave results with another source (like local results), decide how to present them:
    - Option 1: Merge into one list sorted by some heuristic (could be tricky).
    - Option 2: Keep separate lists (e.g., show local results first under a header "Your Stuff", then Brave results).
  - Keep it simple initially, possibly not merging at all unless explicitly needed. Simpler to choose one source at a time or just append one after the other.
- **Post-Processing**:
  - If any filtering is needed (e.g., remove duplicate URLs if some appear in both local and Brave results), implement that after fetching both sets.
  - If weighting sources, define clear rules (like always prefer local data for exact matches, otherwise Brave).
- **Testing**:
  - If implemented merging, test the scenarios (no local results, some local results, etc.) and ensure it behaves as expected.

## Query Parsing
- **Normalization**: Trim whitespace on queries. You may lowercase for cache keys, but maintain original case for sending to Brave (in case case matters for the API, likely not).
- **Special Commands**:
  - We might want to support prefixes like `!` commands (as mentioned in global instructions):
    - `!local query` to search only in local data.
    - `!brave query` or no prefix to search Brave.
  - Implement this in a function `parseQuery(input)` that returns an object like `{ source: 'local' | 'brave', query: '...' }`.
  - If no special prefix, default `source` to 'brave'.
- **Safe Search Toggle**:
  - If safe search level is user-configurable, incorporate that. E.g., `safe=off` might allow more adult results if Brave supports a parameter for that.
  - Ensure the safe search setting is forwarded to Brave API correctly.
- **Stopwords/Stemming**: We generally rely on Brave to handle query interpretation. Our system doesn’t need to remove stopwords or stem words.

## Caching Mechanism
- The search results cache (from the backend guidelines) is a key part of search logic.
- **Key Strategy**: Use the raw query string (or a normalized form) as the key. If different providers or safe search settings are present, include those in the key (e.g., `duck::cats`, `brave-safe::cats`).
- **TTL**: A moderate TTL (e.g., 5 minutes) balances freshness with performance. Possibly shorter for certain queries if they tend to change (like news), but we won't complicate that initially.
- **Invalidation**: If the cache is in-memory, it resets on server restart. That’s fine. If we had persistent cache, we'd have to consider invalidation on data changes, but not needed now.

## Ensuring Reliability
- **Unit Tests**:
  - If there's logic for `parseQuery` or merging, write tests as per the prompt instructions.
  - Test caching logic (maybe by calling the search function twice in a row with a stubbed Brave service to see that second time returns cached data).
- **Error Propagation**:
  - Ensure that if Brave API fails and throws, our logic passes that error up to the controller to handle appropriately (don’t catch it silently in the service without informing the user).
- **Copilot Guidance**:
  - Any Copilot suggestion that tries to implement something complex (like a whole ranking algorithm or an alternate search method) should be weighed against these guidelines.
  - The focus should remain on orchestrating calls and simple combination of results, not reinventing search algorithms.

By keeping the search logic straightforward and deferring to Brave for heavy lifting, we reduce potential errors and complexities. Copilot will thus stay aligned with using external results and simple local handling, rather than introducing unwarranted complexity.
