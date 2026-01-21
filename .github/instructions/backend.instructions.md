
# Backend Guidelines

## Architecture & Structure
- The backend uses **Node.js** (LTS) and **Express.js** to handle API requests. Organise code into:
  - `routes/` for defining Express route endpoints.
  - `controllers/` for handling request logic for each route.
  - `services/` for any heavy logic or external API interactions (e.g., a `braveService` to call Brave API).
  - `middleware/` for custom middleware (auth checks, rate limiting, etc.).
- Keep controllers lean: they should parse request data, call services, and formulate responses. Put complex logic in services or helpers.

## API Design
- **Endpoints**: The key endpoint is `GET /api/search`. It takes a query string parameter `q`. If needed, additional endpoints could be added (e.g., `/api/suggest` for suggestions, or separate routes for image search).
- **Input Validation**: Validate inputs at the boundary:
  - If `q` is missing or empty, return `400 Bad Request` with a JSON error (like `{ "error": "Query parameter 'q' is required" }`).
  - Sanitize `q` if you use it in any context other than sending to Brave (currently, we just forward it, which is fine).
- **Response Format**: JSON, as outlined in global instructions. Typically:
  ```json
  {
    "query": "example",
    "results": [ ... ],
    "engine": "Brave",
    "type": "web",
    "elapsedMs": 200
  }
  ```
  Include relevant information. The `results` field should be an array of result objects (with at least title, url, snippet).
- **Error Handling**: Use consistent error responses:
  - For client errors (400 range), include a helpful message. For server/upstream errors (500 range), a generic message is okay (log details internally).
  - Ensure the HTTP status code matches the situation (400, 404, 500, 502, etc.).
- **CORS**: Use the `cors` package to allow the front-end origin to access the API. In dev, likely `http://localhost:3000`. In production, set to your actual domain, or use `*` if open (but better to restrict).

## Brave API Integration
- **Configuration**: Pull the Brave API key from config (`process.env.BRAVE_API_KEY`). Also configure the base URL and any required headers or query params.
- **Functionality**: Implement a function (e.g., `queryBrave(query)`) that:
  - Constructs the API URL (e.g., `https://api.brave.com/search?q=<encoded query>&key=<API key>` or as per Brave's documentation).
  - Makes the HTTP request (using `node-fetch` or `axios`).
  - Awaits and parses the response (assuming JSON).
  - Returns a structured result (or throws an error if response is not OK).
- **Error Handling**: If Brave's API returns an error or non-200 status:
  - Map it appropriately. For instance, a 401 should log "Invalid API key or unauthorized", a 429 might trigger backing off.
  - Throw an error that the controller can catch and turn into a 502/503.
- **Performance**: The Brave API call is the slowest part. The caching layer (discussed later) will mitigate repeated queries. Possibly use keep-alive with axios to reuse TCP connections for multiple requests.

## Performance & Caching
- **In-Memory Cache**: Implement a simple cache for search results to avoid hitting Brave repeatedly for the same query in a short span.
  - A key-value store (e.g., a Map) where key is the query string (and any other param affecting results, like 'type').
  - Value is the results object (and perhaps a timestamp).
  - Before calling Brave, check cache. If present and fresh (e.g., within 5 minutes), return cached results.
  - After fetching new results, store them in cache.
  - Limit cache size (e.g., use an LRU strategy to evict old entries if beyond, say, 100 entries).
- **Request Throttling**: Implement rate limiting using a middleware like `express-rate-limit`:
  - For example, limit each IP to X requests per minute to prevent abuse and protect upstream.
  - Provide a proper response (429 Too Many Requests) if limit exceeded.
- **Scalability**: While beyond initial scope, note that if deployed on multiple servers, a distributed cache (Redis, etc.) might be needed to share results and rate-limit info. Keep code structured to allow swapping out in-memory with a distributed solution.

## Error Handling & Logging
- **Global Error Handler**: Set up `app.use((err, req, res, next) => { ... })` at the end of routes:
  - Log the `err` (stacktrace in dev, minimal in prod).
  - Send a `500 Internal Server Error` JSON response if the error wasn't already handled.
- **Logging**:
  - Use a simple logger (console.log for dev or a library for prod) to log requests and responses status.
  - Log at start of a request (method, path, maybe query) and end (status code, response time).
  - Be cautious not to log sensitive data (avoid logging full query terms or keys in prod logs).
- **Testing**:
  - Write tests for the controller (simulate requests with valid and invalid params and check responses).
  - Write tests for the Brave service function (you can stub the HTTP call or use a library like nock to simulate Brave API responses).
  - These ensure that if Copilot suggests changes, the core functionality remains correct.

## Security Considerations
- **No Shell Execution**: The backend should not execute any shell commands or start any new processes except the server itself. (No need in this project, just a rule to enforce.)
- **Input sanitization**: Since our input is just a search query passed to Brave, and we escape output on front-end, the risk is low. But if we did anything else with the input, we'd sanitize accordingly.
- **Rate Limit & Abuse**: As mentioned, protect the API from being hammered (since it could expose our Brave API key usage).
- **HTTPS**: Serve the API over HTTPS in production to protect the query content and API key in transit.
- **Helmet**: Consider using `helmet` middleware to set security headers (CSP, HSTS, etc.) especially if the backend also serves the frontend or any static files.

## Maintenance
- Keep dependencies up to date (run `npm audit` occasionally).
- Document any new environment vars or setup steps in README.
- All Copilot suggestions for backend must be checked for compliance with these guidelines (e.g., no leaking of secrets, no bad practices like blocking the event loop).
- By following these rules, the backend remains secure, performant, and easy to work with. Copilot will produce suggestions that align closely with these patterns, reducing friction.
