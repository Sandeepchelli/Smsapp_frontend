/**
 * Centralized API URL resolver.
 * Supports VITE_API_URL environment variable for production deployments (e.g. Render, Railway, Netlify).
 * Falls back to relative paths for local development proxy.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export function getApiUrl(path) {
  if (!path) return API_BASE_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

export default getApiUrl;
