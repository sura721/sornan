import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Read the base URL of the backend server from environment variables.
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// If the variable is not set, log an error for easier debugging.
if (!backendUrl) {
  console.error("FATAL ERROR: VITE_BACKEND_URL is not defined in the .env file.");
}

// Returns a full URL for images stored under uploads/ on the API server.
export function getImageUrl(pathOrUrl?: string) {
  if (!pathOrUrl) return undefined;
  
  // If it's already a full URL (like from a local object URL), return it as-is.
  if (/^https?:\/\//i.test(pathOrUrl) || pathOrUrl.startsWith('blob:')) {
    return pathOrUrl;
  }

  // If it's a relative path from our uploads folder, construct the full URL.
  if (pathOrUrl.startsWith('uploads/') || pathOrUrl.startsWith('/uploads/')) {
    // --- FINAL EDIT START: This logic is now more robust ---
    // 1. Remove any trailing slash from the backend URL.
    const cleanedBaseUrl = backendUrl.replace(/\/$/, '');
    // 2. Remove any leading slash from the image path.
    const cleanedPath = pathOrUrl.replace(/^\//, '');
    // 3. Join them with a single slash, preventing errors like 'http://...//uploads'.
    return `${cleanedBaseUrl}/${cleanedPath}`;
    // --- FINAL EDIT END ---
  }

  // Fallback for any other case.
  return pathOrUrl;
}