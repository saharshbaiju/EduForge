const rawUrl = import.meta.env.VITE_API_BASE_URL;

// Debug logging (temporary as requested)
console.log("VITE_API_BASE_URL raw value:", rawUrl);

// Fallback logic to prevent '/undefined/...' URLs
// If it's missing, we default to localhost for dev.
// In production, if this is undefined, it indicates a build-time configuration issue.
const fallbackUrl = "http://localhost:5000";
const baseUrl = rawUrl || fallbackUrl;

// Ensure no trailing slash to prevent double slashes in requests
export const API_BASE_URL = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

console.log("Effective API_BASE_URL:", API_BASE_URL);
