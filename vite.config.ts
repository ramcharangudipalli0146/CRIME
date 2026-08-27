import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

/**
 * This app is published as a GitHub Pages *project* site, which is served from
 * https://<user>.github.io/CRIME/ rather than from the domain root. Without a
 * matching `base`, Vite emits root-absolute asset URLs like `/assets/app.js`,
 * the browser requests them from the domain root, they 404, and the page
 * renders blank. Keep this in sync with the repository name.
 *
 * For local `vite dev` / `vite preview` this simply serves the app under
 * http://localhost:5173/CRIME/, which mirrors production.
 */
const BASE_PATH = '/CRIME/';

/**
 * GitHub Pages is a static file host with no SPA rewrite rule, so a hard
 * refresh or a shared deep link such as /CRIME/network asks for a file that
 * does not exist and gets GitHub's 404 page. Publishing a byte-for-byte copy
 * of index.html as 404.html makes Pages hand any unknown path back to the app,
 * letting React Router resolve the route on the client.
 */
function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    closeBundle() {
      const index = fileURLToPath(new URL('./dist/index.html', import.meta.url));
      const fallback = fileURLToPath(new URL('./dist/404.html', import.meta.url));

      if (existsSync(index)) {
        copyFileSync(index, fallback);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: BASE_PATH,
  plugins: [react(), spaFallback()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
