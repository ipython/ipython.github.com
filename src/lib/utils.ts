import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ObjectValues<T> = T[keyof T];

/**
 * Join a path with the base URL, ensuring proper slashes
 * Handles cases where BASE_URL may or may not end with /
 */
export function baseUrl(path: string): string {
  const base = import.meta.env.BASE_URL;
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Ensure base ends with /, then concatenate
  const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
  return `${baseWithSlash}${cleanPath}`;
}
