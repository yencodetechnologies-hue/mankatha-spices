const { createProxyMiddleware } = require("http-proxy-middleware");

/**
 * Proxies /api/* from the React dev server to the Express backend.
 * Port must match backend `PORT` / `.env` — override with REACT_APP_BACKEND_PORT (same as adminApiBase).
 */
module.exports = function setupProxy(app) {
  const port = process.env.REACT_APP_BACKEND_PORT || "5000";
  const target = `http://127.0.0.1:${port}`;
  app.use(
    "/api",
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );
};
