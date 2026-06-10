FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@11.5.2

COPY package.json pnpm-workspace.yaml .npmrc ./
RUN pnpm install

COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm@11.5.2

COPY package.json pnpm-workspace.yaml .npmrc ./
RUN pnpm install --prod

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
