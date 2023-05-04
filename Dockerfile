FROM node:18-alpine as builder
RUN corepack enable && corepack prepare pnpm@latest-8 --activate

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

COPY . .

ARG APP_ENV=development
ENV NODE_ENV=${APP_ENV}

RUN pnpm run build

RUN pnpm prune


FROM node:18-alpine

ARG APP_ENV=development
ENV NODE_ENV=${APP_ENV}

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

USER node
CMD [ "npm", "run", "start:prod" ]
