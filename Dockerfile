# syntax=docker/dockerfile:1.10

FROM node:22-bookworm AS base
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable

# -------- Dependencies layer -----------------------------------------------------
FROM base AS deps
COPY package.json yarn.lock ./
COPY libs ./libs
# Install dependencies (prod+dev, we keep dev so that tsx is available for the worker)
RUN yarn install --immutable --inline-builds

# -------- Build layer ------------------------------------------------------------
FROM deps AS builder

# Public build-time config only. NEXT_PUBLIC values are inlined into the
# client bundle anyway, so it is safe for them to appear in image history.
ARG NEXT_PUBLIC_ENV
ARG NEXT_SHARP_PATH
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID
ARG NEXT_PUBLIC_ORIGIN
ARG NEXT_PUBLIC_COOKIE_DOMAIN
ARG NEXT_PUBLIC_CAPTCHA_SITE_KEY
ARG NEXT_PUBLIC_TYPESENSE_HOST
ARG NEXT_PUBLIC_TYPESENSE_PORT
ARG NEXT_PUBLIC_TYPESENSE_PROTOCOL

COPY . .
# 1) Apply migrations to ensure the database schema exists
# 2) Generate Prisma client (incl. TypedSQL) against the migrated database
# 3) Build standalone Next.js output
# 4) Copy static assets into standalone folder
#
# Private env vars are delivered as BuildKit secret mounts
# so their values never land in image layers or history.
RUN \
    --mount=type=secret,id=DATABASE_URL,env=DATABASE_URL,required=true \
    --mount=type=secret,id=DB_SSL,env=DB_SSL,required=true \
    --mount=type=secret,id=REDIS_TTL,env=REDIS_TTL,required=true \
    --mount=type=secret,id=REDIS_PASSWORD,env=REDIS_PASSWORD,required=true \
    --mount=type=secret,id=REDIS_HOST,env=REDIS_HOST,required=true \
    --mount=type=secret,id=REDIS_PORT,env=REDIS_PORT,required=true \
    --mount=type=secret,id=SMTP_HOST,env=SMTP_HOST,required=true \
    --mount=type=secret,id=SMTP_USERNAME,env=SMTP_USERNAME,required=true \
    --mount=type=secret,id=SMTP_PASSWORD,env=SMTP_PASSWORD,required=true \
    --mount=type=secret,id=GOOGLE_LOGGING_CREDENTIALS_BASE64,env=GOOGLE_LOGGING_CREDENTIALS_BASE64,required=true \
    --mount=type=secret,id=GOOGLE_STORAGE_CREDENTIALS_BASE64,env=GOOGLE_STORAGE_CREDENTIALS_BASE64,required=true \
    --mount=type=secret,id=GOOGLE_GMAIL_CREDENTIALS_BASE64,env=GOOGLE_GMAIL_CREDENTIALS_BASE64,required=true \
    --mount=type=secret,id=GOOGLE_API_PROJECT_ID,env=GOOGLE_API_PROJECT_ID,required=true \
    --mount=type=secret,id=GOOGLE_OAUTH_CLIENT_SECRET,env=GOOGLE_OAUTH_CLIENT_SECRET,required=true \
    --mount=type=secret,id=GOOGLE_OAUTH_REDIRECT_URI,env=GOOGLE_OAUTH_REDIRECT_URI,required=true \
    --mount=type=secret,id=GOOGLE_STORAGE_BUCKET_RECIPE_IMAGES,env=GOOGLE_STORAGE_BUCKET_RECIPE_IMAGES,required=true \
    --mount=type=secret,id=GOOGLE_STORAGE_BUCKET_AVATAR_IMAGES,env=GOOGLE_STORAGE_BUCKET_AVATAR_IMAGES,required=true \
    --mount=type=secret,id=REVALIDATE_PATH_TOKEN,env=REVALIDATE_PATH_TOKEN,required=true \
    --mount=type=secret,id=TYPESENSE_API_KEY,env=TYPESENSE_API_KEY,required=true \
    --mount=type=secret,id=OPENAI_API_KEY,env=OPENAI_API_KEY,required=true \
    --mount=type=secret,id=ALLOWED_ORIGINS,env=ALLOWED_ORIGINS,required=true \
    --mount=type=secret,id=MAIL_DRIVER,env=MAIL_DRIVER,required=true \
    --mount=type=secret,id=CONTACT_EMAIL,env=CONTACT_EMAIL,required=true \
    --mount=type=secret,id=CAPTCHA_SECRET_KEY,env=CAPTCHA_SECRET_KEY,required=true \
    
    # Force a single DB connection for the whole build. next build prerenders
    # pages with multiple workers, each process holding its own Prisma pool
    # (default connection_limit), so the peak can be workers × limit and exhaust
    # the database's connection slots.
    case "$DATABASE_URL" in \
        *connection_limit=*) DATABASE_URL="$(printf '%s' "$DATABASE_URL" | sed -E 's/connection_limit=[0-9]+/connection_limit=1/')" ;; \
        *\?*)                DATABASE_URL="${DATABASE_URL}&connection_limit=1" ;; \
        *)                   DATABASE_URL="${DATABASE_URL}?connection_limit=1" ;; \
    esac; \
    case "$DATABASE_URL" in \
        *pool_timeout=*) DATABASE_URL="$(printf '%s' "$DATABASE_URL" | sed -E 's/pool_timeout=[0-9]+/pool_timeout=30/')" ;; \
        *)               DATABASE_URL="${DATABASE_URL}&pool_timeout=30" ;; \
    esac; \
    export DATABASE_URL; \
    yarn prisma migrate deploy \
    && yarn prisma generate --sql \
    && yarn next build --webpack \
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

ENV HOSTNAME=0.0.0.0
ENTRYPOINT ["/entrypoint.sh"]
# Default command runs the Next.js server; worker container overrides this
CMD ["node","server.js"]
