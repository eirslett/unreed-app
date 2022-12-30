import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter, authMiddleware } from './auth.js';
import { setupIndexHtml, setupStaticResources } from './static-resources.js';

export const app = express();
app.enable('trust proxy');

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => res.send({ status: 'OK' }));

await setupStaticResources(app);

app.use(authRouter);

app.use(authMiddleware);

await setupIndexHtml(app);

app.get('/foo', (req, res) => {
  res.send('Hello world!');
});
