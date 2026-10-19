# Build from the repository root:
#   docker build -f apps/relay/Dockerfile -t weft-relay .
FROM node:22-alpine AS build
WORKDIR /repo
RUN corepack enable
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages/protocol packages/protocol
COPY apps/relay apps/relay
RUN pnpm install --frozen-lockfile --filter @weft/relay... \
 && pnpm --filter @weft/protocol build \
 && pnpm --filter @weft/relay build \
 && pnpm deploy --filter @weft/relay --prod --legacy /out

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /out /app
USER node
EXPOSE 8787
CMD ["node", "dist/main.js"]
