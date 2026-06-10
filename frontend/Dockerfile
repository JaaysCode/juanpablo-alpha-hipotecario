FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@11.5.2

COPY package.json pnpm-workspace.yaml ./
RUN pnpm install

COPY . .
RUN pnpm build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist/frontend-app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
