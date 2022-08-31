# https://github.com/vercel/next.js/blob/47a61207384c5fb2776202b8aeb7fbbc24bc6360/examples/with-docker/Dockerfile
# (c) 2014 Call-Em-All & individual contributors
# Dynatrace has made changes to this code snippet. This code snippet is supplied
# without warranty, and is available under The MIT License (MIT).

# install dependencies only when needed
FROM node:18-alpine as deps

# fix https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
RUN apk --update --no-cache add libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

# rebuild the source code only when needed
FROM node:18-alpine as builder

WORKDIR /app
ENV NODE_ENV production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# production image, copy all the files and run next
FROM node:18-alpine as runner

WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000

# workaround https://github.com/vercel/next.js/discussions/34894
CMD ["./docker-entrypoint.sh"]
