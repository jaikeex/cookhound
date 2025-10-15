# syntax=docker/dockerfile:1.5

FROM node:20-bookworm AS base
WORKDIR /app
ENV NODE_ENV=production

ARG NEXT_PUBLIC_ENV
ARG NEXT_SHARP_PATH
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID
ARG NEXT_PUBLIC_ORIGIN
ARG NEXT_PUBLIC_COOKIE_DOMAIN
ARG ALLOWED_ORIGINS
ARG GOOGLE_OAUTH_CLIENT_SECRET
ARG GOOGLE_OAUTH_REDIRECT_URI
ARG GOOGLE_SMTP_USERNAME
ARG GOOGLE_SMTP_PASSWORD
ARG LOG_DIR
ARG GOOGLE_API_PROJECT_ID
ARG GOOGLE_LOGGING_CREDENTIALS_BASE64
ARG GOOGLE_STORAGE_CREDENTIALS_BASE64
ARG GOOGLE_GMAIL_CREDENTIALS_BASE64
ARG GOOGLE_STORAGE_BUCKET_RECIPE_IMAGES
ARG GOOGLE_STORAGE_BUCKET_AVATAR_IMAGES
ARG REVALIDATE_PATH_TOKEN
ARG DB_NAME
ARG DB_USERNAME
ARG DB_PASSWORD
ARG DB_PORT
ARG DATABASE_URL
ARG DB_CONNECTIONS
ARG DB_IDLE_TIMEOUT
ARG DB_ACQUIRE_TIMEOUT
ARG DB_MAX_ATTEMPTS
ARG REDIS_TTL
ARG REDIS_PASSWORD
ARG REDIS_HOST
ARG REDIS_PORT
ARG TYPESENSE_API_KEY
ARG NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_KEY
ARG NEXT_PUBLIC_TYPESENSE_HOST
ARG NEXT_PUBLIC_TYPESENSE_PORT
ARG NEXT_PUBLIC_TYPESENSE_PROTOCOL
ARG OPENAI_API_KEY
ARG MAIL_DRIVER
ARG MAIL_GMAIL_FROM
ARG CONTACT_EMAIL

RUN corepack enable

# -------- Dependencies layer -----------------------------------------------------
FROM base AS deps
COPY package.json yarn.lock ./
COPY libs ./libs
# Install dependencies (prod+dev, we keep dev so that tsx is available for the worker)
RUN yarn install --immutable --inline-builds

# -------- Build layer ------------------------------------------------------------
FROM deps AS builder
COPY . .
# 1) Apply migrations to ensure the database schema exists
# 2) Generate Prisma client (incl. TypedSQL) against the migrated database
# 3) Build standalone Next.js output
# 4) Copy static assets into standalone folder
RUN yarn prisma migrate deploy \
    && yarn prisma generate --sql \
    && yarn next build \
    && node scripts/copy-standalone.js

# -------- Runtime image ----------------------------------------------------------
FROM base AS runner
# Copy all node_modules (incl. dev deps so that tsx is available)
COPY --from=builder /app/node_modules ./node_modules
ENV PATH="/app/node_modules/.bin:${PATH}"
# Copy application build artifacts
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./public/_next/static
COPY --from=builder /app/public ./public
# Copy application source needed for worker & migrations
COPY --from=builder /app/src ./src
# Ensure tsconfig.json is present for tsx path alias resolution at runtime
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/prisma ./prisma
# Entrypoint wraps Prisma migrate and then execs CMD/args
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
ENV PORT=3000
ENTRYPOINT ["/entrypoint.sh"]
# Default command runs the Next.js server; worker container overrides this
CMD ["node","server.js"]
