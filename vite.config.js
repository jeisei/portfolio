import { defineConfig } from 'vite';

function serveLocalContactStatus(server) {
  server.middlewares.use('/.netlify/functions/contact', (request, response, next) => {
    if (request.method !== 'GET') return next();
    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
    });
    response.end(JSON.stringify({ available: false }));
  });
}

export default defineConfig({
  // Serve fonts as local files to match the Content Security Policy.
  build: { assetsInlineLimit: 0 },
  plugins: [{
    name: 'local-contact-status',
    configureServer: serveLocalContactStatus,
    configurePreviewServer: serveLocalContactStatus,
  }],
});
