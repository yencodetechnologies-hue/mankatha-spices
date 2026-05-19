// Runtime config for deployments (loaded before the React bundle).
// Set API_BASE_URL to your backend origin or full API base path.
//
// Examples:
// - "https://api.example.com"            -> frontend will call https://api.example.com/api/...
// - "https://example.com/spice-api"      -> frontend will call https://example.com/spice-api/auth/login ...
//
// IMPORTANT: This is evaluated in the browser. Do not put secrets here.
window.__APP_CONFIG__ = {
  API_BASE_URL: "https://mankathaspi.octosofttechnologies.in/",
};

