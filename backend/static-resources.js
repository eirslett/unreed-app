import { isDevelopment } from './utils.js';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupStaticResources(app) {
  if (isDevelopment()) {
    console.log('Running server in development mode');
    const { createServer: createViteServer } = await import('vite');
    const viteServer = await createViteServer({
      server: { middlewareMode: true, appType: 'custom' },
    });

    app.use(viteServer.middlewares);

    async function serveIndexHtml(req, res) {
      const indexHtml = fs.readFileSync(
        path.resolve(__dirname, '..', 'index.html'),
        'utf-8'
      );
      const processed = await viteServer.transformIndexHtml('/', indexHtml);
      res.send(processed);
    }
    app.use(serveIndexHtml);
  } else {
    console.log('Running server in production mode');
    app.use(express.static(path.resolve(__dirname, '..', 'dist')));
    app.use((req, res) =>
      res.sendFile(path.resolve(__dirname, 'dist/index.html'))
    );
  }
}
