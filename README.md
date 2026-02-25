# Cookhound

## For interwievers

Disclaimer: This project is for learning new things first and for fun second. There are choices that would perhaps not make much sense in a real business project.
These include:

- Code written for learning. Things like (but not limited to) the cookie consent, rate limiting and session management. Number of 3rd party libraries could solve these issues quickly, and most certainly better than I did, but it was a good challenge and learning opportunity. Also, the less dependencies the better in my opinion. Also the weird commit prefix thing.

- Structural choices that I personally like. These include the rigid `component/index` file pattern, service and model separation (also classes everywhere) and comment section banners. While not standard (or even preferred) by most teams I think, these just click for me in this project.

- Redis. Project of this size objectively does not need redis for caching (or any caching for that matter), but I wanted to know if cache invalidation really is the hardest thing in programming (I am starting to think it is...) and when i had it set up I started looking for other ways to make use of it, so now it handles queues and sessions as well!

- Deployment. Hosting this on vercel or similar would save me a couple days of time (and also money at this stage), but having everything under control just feels so much better.

I am always open to feedback. Even though you came here for different reasons, If you would like to share any thoughts on this project, I would be very grateful!

I was (of course) using llms for various tasks when writing this project, mainly the anthropic models as well as o3 from openai when it was relevant.

## Overview

Cookhound is a full-stack web application built on a modern stack.

- **Frontend** – Next.js 15 app router with React 19, TailwindCSS for styling and atomic design for component organization.
- **Backend** – Next.js api routes with dedicated service and model layers.
- **Database** – PostgreSQL with Prisma.
- **Caching & Jobs** – Redis handles rate-limiting, caching, sessions and BullMQ job queues.
- **Search** – Typesense provides full-text search over recipes.
- **Testing** – Vitest for unit testing and Playwright for end-to-end tests.
- **Logging** - Wisnton with daily rotating files
- **DevOps** – Docker deployment to a DigitalOcean droplet.

Guiding principles: strict type-safety, clear separation of concerns, minimal runtime dependencies and, above all, realiability.

### LOC count (as of 1.1.1)

Total : 964 files, 45211 codes, 6991 comments, 8564 blanks, all 60766 lines

| language           | files |   code | comment | blank |  total |
| :----------------- | ----: | -----: | ------: | ----: | -----: |
| TypeScript         |   645 | 23,002 |   5,461 | 5,201 | 33,664 |
| TypeScript JSX     |   213 | 16,863 |   1,049 | 2,718 | 20,630 |
| JSON               |     9 |  1,383 |       0 |     9 |  1,392 |
| JavaScript         |    13 |  1,328 |     208 |   186 |  1,722 |
| PostCSS            |    10 |    857 |       9 |   127 |    993 |
| MS SQL             |    22 |    840 |     244 |   155 |  1,239 |
| Markdown           |     2 |    323 |       0 |   108 |    431 |
| XML                |    41 |    288 |       0 |    23 |    311 |
| YAML               |     4 |    199 |       0 |    23 |    222 |
| Docker             |     1 |     74 |      15 |     8 |     97 |
| JSON with Comments |     1 |     45 |       0 |     1 |     46 |
| Shell Script       |     1 |      6 |       3 |     3 |     12 |
| Ignore             |     1 |      2 |       0 |     1 |      3 |
| TOML               |     1 |      1 |       2 |     1 |      4 |

## Getting Started

### Prerequisites

#### Node.js

This project requires Node.js version 22 or higher.
You can download and install Node.js from the official website: https://nodejs.org/en/

#### Yarn

Default package manager is yarn v 4.1.0. On most systems, you can follow these steps:

- `corepack enable`
- `yarn set version 4.1.0`
- `yarn -v` should show 4.1.0

If this does not work, google it or switch to other manager.

#### Self-hosted services

Postgres, redis and typesense are all running locally via docker when developing. You need the db up and running in order to build
this project (well, technically you need it to generate the prisma types, but the build will fail without the the types
generated), and both redis and db to actually run it. Typesense is optional as all queries will fallback to using db if
typesense is not accessible.
You can start everything at once by running the compose config in `docker-compose-local`

#### Running the project

- `yarn install`
- `docker-compose up -d` using the local compose config
- `yarn migrate` when starting from a fresh db
- `yarn generate` to generate necessary prisma types
- `yarn seed` to seed the db
- `yarn setup-typesense` copy the returned api key into .env
- `yarn dev`

## Important commands I might forget

### Connect to the droplet via ssh

```bash
ssh -i ssh/cookhound-digitalocean root@<IP>
```

### Download logs from the droplet

Substitute the date with the date of the logs you want to download.

```bash
scp -i ssh/cookhound-digitalocean root@<IP>:/var/log/cookhound/cookhound-api-2025-10-08.log logs-droplet/cookhound-api-2025-10-08.log
```

### bash into a container

```bash
docker exec -it cookhound-web-1 bash
```

### login to redis with username and password

The password must be surrounded by single quotes.

```bash
redis-cli -h localhost -p 6379 -a '<password>'
```

### edit site nginx config

```bash
nano etc/nginx/sites-available/cookhound.com
```

### edit global nginx config

```bash
nano etc/nginx/nginx.conf
```

### restart nginx

```bash
systemctl restart nginx
```
