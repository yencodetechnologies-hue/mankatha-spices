// Runtime config for deployments (loaded before the React bundle).
// Set API_BASE_URL to your backend origin or full API base path.
//
// Examples:
// - "https://api.example.com"            -> frontend will call https://api.example.com/api/...
// - "https://example.com/spice-api"      -> frontend will call https://example.com/spice-api/auth/login ...
//
// IMPORTANT: This is evaluated in the browser. Do not put secrets here.
// Leave API_BASE_URL empty for local development — the CRA dev server's
// setupProxy.js will forward /api/* to http://127.0.0.1:5000 automatically.
// On production (VPS), the deployment script overwrites this file with the
// real backend URL so the browser knows where to call the API.
window.__APP_CONFIG__ = {
  API_BASE_URL: "",
};

