FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY tsconfig*.json ./
COPY src ./src
COPY content ./content
RUN npm run build && npm prune --omit=dev --no-audit --no-fund

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/content ./content
COPY package*.json ./
RUN mkdir -p data storage/chat storage/content
EXPOSE 3000
CMD ["node", "dist/main.js"]
