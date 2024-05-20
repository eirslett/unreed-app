import { isDevelopment } from './utils.js';
import fs from 'fs';
import path from 'path';
import express, { Application, Request, Response } from 'express';
import { fileURLToPath } from 'url';
import { type ViteDevServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let _viteServer: ViteDevServer | undefined;
async function getViteServer() {
  if (!_viteServer) {
    const { createServer: createViteServer } = await import('vite');
    _viteServer = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
  }
  return _viteServer;
}

export async function setupStaticResources(app: Application) {
  if (isDevelopment()) {
    const viteServer = await getViteServer();
    app.use(viteServer.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, '..', 'dist')));
  }
}

export async function setupIndexHtml(app: Application) {
  if (isDevelopment()) {
    async function serveIndexHtml(req: Request, res: Response) {
      const indexHtml = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf-8');
      const viteServer = await getViteServer();
      const processed = await viteServer.transformIndexHtml('/', indexHtml);
      res.send(processed);
    }
    app.use(serveIndexHtml);
  } else {
    app.use((req, res) => res.sendFile(path.resolve(__dirname, '../dist/index.html')));
  }
}
