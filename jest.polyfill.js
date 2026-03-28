/**
 * Pre-module polyfill for Web APIs needed by Next.js API routes.
 * This file runs via setupFiles (before any test modules are imported),
 * so Request/Response/Headers are available when next/server is first evaluated.
 */
if (typeof global.Request === "undefined") {
  try {
    const { Request, Response, Headers, fetch } = require("undici");
    global.Request = Request;
    global.Response = Response;
    global.Headers = Headers;
    global.fetch = fetch;
  } catch (e) {
    // undici not available — rely on Node 20+ native globals
  }
}
