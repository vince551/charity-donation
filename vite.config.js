import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  // GitHub Pages needs the repository sub-path; Vercel serves from the domain root.
  base: isGitHubPages ? '/charity-donation/' : '/',
  plugins: [react()],
  server: { port: 5173 },
  build: { sourcemap: true }
});
