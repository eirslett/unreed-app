import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter, authMiddleware } from './auth';
import { router } from './router';
import { setupIndexHtml, setupStaticResources } from './static-resources';

export const app = express();
app.enable('trust proxy');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => res.send({ status: 'OK' }));

await setupStaticResources(app);

app.use(authRouter);

app.use(authMiddleware);

app.use(router);

await setupIndexHtml(app);
