import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// Get base path from environment variable
// For GitHub Pages: if repo is username.github.io, use "" (root)
// Otherwise use /repo-name (must start with / and not end with /)
// Can be set via BASE_PATH env var or defaults to empty (root)
let base = process.env.BASE_PATH || "";

// Normalize base path: ensure it starts with / if not empty, and remove trailing /
if (base && !base.startsWith('/')) {
  base = '/' + base;
}
if (base.endsWith('/') && base !== '/') {
  base = base.slice(0, -1);
}

// Construct site URL - GitHub Pages format
const owner = process.env.GITHUB_REPOSITORY_OWNER || 'carreau';
const site = base 
  ? `https://${owner}.github.io${base}`
  : `https://${owner}.github.io`;

export default defineConfig({
  integrations: [react(), tailwind()],
  base: base,
  site: site,
  output: "static",
});
