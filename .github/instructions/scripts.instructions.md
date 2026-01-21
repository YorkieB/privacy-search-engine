
# Script Guidelines

The `scripts/` directory holds standalone scripts for maintenance or automation tasks (not part of the main app flow). Examples might include data cleanup, seeding, build tasks, etc.

## General Principles
- **Explain Purpose**: Each script should start with comments explaining what it does and how to use it.
  ```javascript
  // exampleUsage.js - Demonstrates how to use the search engine API for a given query.
  // Usage: node scripts/exampleUsage.js "search term"
  ```
- **Idempotence & Safety**: Scripts that modify data or state should be safe to run multiple times or have clear warnings:
  - If a script can delete or reset things, require a `--force` flag or confirmation step.
  - If it writes files, make backups or write to new files instead of overwriting existing critical ones.
- **Leverage App Code**: Where possible, import and reuse existing code instead of duplicating logic:
  - e.g., if a script needs to make a search query, it can require the `braveService` from the app and call it directly.
  - If a script needs database access (not in this project since no DB), import the DB module from the app, etc.
- **Config**: Load environment variables at the start (use `require('dotenv').config()`). Use the config module if available, to ensure the script honors the same config as the app.

## Examples of Potential Scripts
- **Cache Warmer**: `warmCache.js` might accept a list of queries (maybe from a file or args) and pre-populate the search results cache by calling the search function for each query.
- **Analytics**: `countQueries.js` could read logs or stored data to count how many times each query was searched (if such logs existed).
- **Deployment**: `deploy.sh` (shell script) or `build.js` to automate building the frontend and packaging it with the backend, if we needed.
- **One-off Data Fetch**: `fetchTrends.js` could call an external service to get trending search terms to display on the homepage. It would fetch data and perhaps output a JSON file in a certain location.

## CLI Behavior
- Use Node’s `process.argv` to accept parameters. For more complex CLI parsing, consider a library like `yargs` for flags and help text.
- If interactive input is needed (should be rare), you can use the `readline` module, but usually we pass all needed info via arguments or env vars.

## Style & Testing
- Write scripts in a simple, straightforward manner. They don't need the same structure as app code (e.g., can just be top-level code) but should still handle errors gracefully.
- If a script becomes large or complex, break it into functions within the script or even modules.
- You can test scripts by running them in a dev environment. If a script is critical (like migration), you might write a small test for its functions, but often manual testing is sufficient.
- Log actions to console so it's clear what the script is doing (e.g., "Fetching trends...", "Completed writing file X").

## Example (template for a safe-destructive script):
```javascript
require('dotenv').config();
const args = process.argv.slice(2);
if (!args.includes('--force')) {
  console.log("This script will clear all cached results. Use --force to execute.");
  process.exit(0);
}
// Proceed with destructive action
const cache = require('../search/cache');
cache.clear();
console.log("Cache cleared successfully.");
```
This script would only clear the cache if `--force` is provided, otherwise it exits after warning.

By following these guidelines, any scripts we add will be reliable, understandable, and will play nicely with the rest of the project. Copilot will also generate script content that respects things like not hardcoding secrets, using config, and being cautious with destructive actions.
