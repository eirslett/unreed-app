FROM node:26.13.0-slim AS base
WORKDIR /usr/src/app

FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM base AS release
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /usr/src/app/server.ts ./server.ts
COPY --from=build /usr/src/app/backend ./backend
COPY --from=build /usr/src/app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "server.ts"]
