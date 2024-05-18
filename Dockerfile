FROM node:22-alpine as builder

WORKDIR /app

COPY package.json package-lock.json vite.config.js tsconfig.json /app/

RUN npm ci

COPY index.html /app/

COPY frontend /app/frontend/

COPY public /app/public/

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json /app/

RUN npm ci --omit=dev

COPY backend /app/backend/

COPY server.js /app/server.js

COPY --from=builder /app/dist /app/dist/

ENV NODE_ENV=production

CMD node server.js
