# Integrate a New Search Provider

**Goal:** Add support for querying an additional search provider (besides Brave) and incorporate it into the project.

**Instructions:**
1. **Research API**: Identify the new search provider’s API (e.g., DuckDuckGo, Bing, etc.) and understand its usage (endpoint URL, query parameters, authentication, rate limits).
2. **Set Up Config**: Add any needed config:
   - If an API key is required, add a new env var in `.env` (e.g., `DUCKDUCKGO_API_KEY`) and include it in the config module.
   - If the API endpoint needs a specific URL, note it.
3. **Implement Service Function**: Create a service module for the provider (e.g., `backend/services/duckDuckGoService.js`):
   - Write an async function (e.g., `queryDuckDuckGo(query)`) that constructs the request to the provider’s API, sends it, and returns data in our standardized format.
   - Parse the returned JSON to extract title, URL, snippet (or whatever is analogous). If the API provides additional info (like an instant answer), decide how to handle that (maybe ignore or include separately).
   - Include error handling: if the API call fails or returns an error in the payload, throw an appropriate error.
4. **Extend Controller**: Modify the search controller to route to this new service when requested:
   - Decide on how the frontend indicates which engine to use. For example, a query param `engine=duck` or `engine=brave`.
   - In the controller, check `req.query.engine` (or `source` as previously considered). If it equals the new provider (say "duck"), call `duckDuckGoService.queryDuckDuckGo(q)`. If not provided or equals "brave", use the Brave service by default.
   - Optionally, allow a combined search (though combining two sets of results may not be straightforward to rank; it might be better to choose one engine at a time).
   - Ensure the response clearly indicates which engine was used (you could set the `engine` property in the response to "DuckDuckGo" or similar).
5. **Frontend UI**:
   - Add a mechanism for the user to select the search provider. For instance, a dropdown menu or toggle on the search bar with options "Brave" and "DuckDuckGo".
   - When the user performs a search, include the selected provider in the request (e.g., append `&engine=duck` to the fetch URL if DuckDuckGo is chosen).
   - Update any UI text if needed (maybe show somewhere which engine is currently selected or being used).
6. **Testing**:
   - Unit test the new service function with mocked API responses. Ensure that for a given sample API JSON, your function returns the expected output shape.
   - Integration test the controller: simulate a request with `engine=newProvider` and verify it invokes the new service (you may stub the service in the test).
   - Test the UI manually (select new provider, perform search, see results).
   - If possible, write a front-end test for provider selection (this could be as simple as setting a select value and ensuring the fetch URL contains the right param).
7. **Documentation & Maintenance**:
   - Update documentation to mention the new provider support (and any setup needed for it, like obtaining an API key).
   - Monitor usage; if the new API has rate limits, ensure they’re not easily exceeded (maybe share cache between providers, etc.).
   - If the provider returns significantly different data (like different fields), consider adjusting our result display or format accordingly.

**Example Scenario:** *Adding Wikipedia as a search source.*
- API: Wikipedia has an open search API (no key required). The service function could call `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=<query>&format=json`.
- It would parse the results to extract the page titles and snippets, then form URLs like `https://en.wikipedia.org/wiki/<Title>`.
- The controller would check for `engine=wiki`.
- The UI might have a dropdown with "Brave Search" and "Wikipedia".
- The response’s `engine` field would be set to "Wikipedia" when that source is used.

Use this blueprint to implement the new provider integration. It will enable users to choose an alternative search source, broadening the functionality of our search engine while keeping the interface and experience consistent.
