# Cookhound Client

This is the frontend client for the Cookhound application.

## Getting Started

### Prerequisites

#### Node.js

This project requires Node.js version 20 or higher.
You can download and install Node.js from the official website: https://nodejs.org/en/

#### Yarn

Default package manager is yarn v 4.1.0. On most systems, you can follow these steps:

- `corepack enable`
- `yarn set version 4.1.0`
- `yarn -v` should show 4.1.0

If this does not work, google it.

## Important commands

### Connect to the droplet via ssh

```bash
ssh -i ssh/cookhound-digitalocean root@209.38.197.52
```

### Download logs from the droplet

Substitute the date with the date of the logs you want to download.

```bash
scp -i ssh/cookhound-digitalocean root@209.38.197.52:/var/log/cookhound/cookhound-api-2025-10-08.log logs-droplet/cookhound-api-2025-10-08.log
```

### bash into a container

```bash
docker exec -it cookhound-web-1 bash
```

### login to redis with username and password

The password must be surrounded by single quotes.

```bash
redis-cli -h localhost -p 6379 -a 'password'
```
