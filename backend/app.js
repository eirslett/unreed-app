import express from 'express';
import { setupStaticResources } from './static-resources.js';

export const app = express();
app.enable('trust proxy');

await setupStaticResources(app);
