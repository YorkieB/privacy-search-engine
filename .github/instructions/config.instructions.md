
# Configuration Guidelines

## Environment Variables & Files
- Use environment variables for all configuration values that differ by environment or are sensitive:
  - **BRAVE_API_KEY**: The API key for Brave Search (required).
  - **PORT**: The port for the backend server (optional, default 3000).
  - **ORIGIN**: Allowed origin for CORS (optional, default `*` or specific domain in prod).
  - **NODE_ENV**: `"development"` or `"production"` (use to toggle behaviours).
- Provide a `.env.example` file in the repo listing required vars (with dummy placeholders) to guide other developers.
- Do not commit actual `.env` files or secrets to version control.

## Config Module
- Create a central config in `config/index.js` (or similar) that reads environment variables and exports a structured object:
  ```js
  require('dotenv').config(); // load .env if present
  const config = {
    port: process.env.PORT || 3000,
    braveApiKey: process.env.BRAVE_API_KEY,
    allowedOrigin: process.env.ORIGIN || '*',
    environment: process.env.NODE_ENV || 'development'
  };
  module.exports = config;
  ```
- This allows easy access to config throughout the app by requiring this module, and provides defaults for convenience (like default port and origin).
- Immediately after defining, validate critical entries:
  ```js
  if (!config.braveApiKey) {
    throw new Error("BRAVE_API_KEY is not defined. Please set it in the environment.");
  }
  ```
  This stops the app with a clear message if something essential is missing.

## Environment-specific Settings
- Use `NODE_ENV` to conditionally set or log things:
  - In development, you might allow more verbose logging or skip certain security measures (like less strict CORS).
  - In production, enforce stricter rules (like require ORIGIN to be set explicitly, enable security headers, etc.).
- Example: Only allow `*` for CORS if `NODE_ENV` is `"development"`; otherwise require a specific origin.

## Documentation
- Document new config options in the README or a dedicated section in documentation. For instance, if we add a `SAFE_SEARCH` env var to control default safe search level, note it down.
- Ensure team members know to set up their `.env` file with required keys.

## Protecting Secrets
- If using source control, consider adding repository secrets or a vault for storing keys in CI/CD rather than hardcoding anywhere.
- In code, never expose the API key (e.g., in error messages or responses). It should only be used in server-to-server calls to Brave.
- If logging requests, ensure the API key is not part of any logged URL (for GET queries, it might appear if put in query param — ideally use headers for the API key if Brave supports it).

## Defaults and Fallbacks
- Provide safe defaults where possible so that the app can still run in dev mode (with limited functionality) if some config is missing:
  - If `BRAVE_API_KEY` is missing, we choose to crash because you can't search without it.
  - If `PORT` is missing, default to 3000 (common default).
  - If `ORIGIN` is missing, default to '*' in dev or none in production (depending on strategy).
- Keep in mind to fail fast for critical things (like API key) and fail safe for optional ones.

By consolidating configuration in this way, the app stays flexible and secure across environments. Copilot should always use `process.env` or the config object for such values, not inline constants, thus adhering to these practices.
