# Docker Development Environment

This guide explains how to use the Docker-based development environment for the automaker-starter-kit project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Available Services](#available-services)
- [Configuration](#configuration)
- [Common Commands](#common-commands)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Platform-Specific Notes](#platform-specific-notes)

## Prerequisites

- **Docker Desktop** (v20.10+) or Docker Engine with Docker Compose
- **Node.js** (v22+) - for running npm commands locally
- **Git** - for version control

### Installing Docker

- **macOS**: [Download Docker Desktop](https://docs.docker.com/desktop/mac/install/)
- **Windows**: [Download Docker Desktop](https://docs.docker.com/desktop/windows/install/)
- **Linux**: [Install Docker Engine](https://docs.docker.com/engine/install/)

## Quick Start

### 1. Database Only (Default - Recommended for Development)

The simplest way to start developing:

```bash
# Start PostgreSQL and Redis
docker compose up -d

# Wait for services to be healthy
docker compose ps

# Run migrations
npm run db:migrate

# Start the development server (with hot-reload)
npm run dev:app
```

### 2. Full Stack Development (All Services in Docker)

Run everything in Docker containers:

```bash
# Copy environment file
cp .env.docker .env

# Start all services including the app
docker compose --profile full up -d

# View logs
docker compose logs -f app
```

### 3. Production Build

Test the production build:

```bash
# Build and run production containers
docker compose --profile production up -d --build

# View production logs
docker compose logs -f app-prod
```

## Available Services

| Service | Port | Description | Profile |
|---------|------|-------------|---------|
| **db** (PostgreSQL) | 5432 | Main database | default |
| **redis** | 6379 | Cache and sessions | default |
| **app** | 3000 | Development app | full |
| **app-prod** | 3000 | Production app | production |
| **adminer** | 8080 | Database UI | full |
| **redis-commander** | 8081 | Redis UI | full |
| **mailhog** | 8025 (UI), 1025 (SMTP) | Email testing | full |

### Accessing Services

- **Application**: http://localhost:3000
- **Adminer (DB UI)**: http://localhost:8080
  - Server: `db`
  - Username: `postgres`
  - Password: `postgres`
  - Database: `automaker`
- **Redis Commander**: http://localhost:8081
- **MailHog**: http://localhost:8025

## Configuration

### Environment Variables

1. Copy the Docker environment template:
   ```bash
   cp .env.docker .env
   ```

2. Modify `.env` with your settings:
   ```env
   # Change ports if defaults conflict
   DB_PORT=5432
   REDIS_PORT=6379
   APP_PORT=3000

   # Add your API keys
   STRIPE_SECRET_KEY=sk_test_...
   GOOGLE_CLIENT_ID=...
   ```

### Changing Ports

If default ports conflict with existing services:

```env
# In .env file
DB_PORT=5433        # PostgreSQL on 5433 instead of 5432
REDIS_PORT=6380     # Redis on 6380 instead of 6379
APP_PORT=3001       # App on 3001 instead of 3000
ADMINER_PORT=8082   # Adminer on 8082 instead of 8080
```

## Common Commands

### Starting Services

```bash
# Start default services (db + redis)
docker compose up -d

# Start all development services
docker compose --profile full up -d

# Start production services
docker compose --profile production up -d

# Rebuild containers after Dockerfile changes
docker compose --profile full up -d --build
```

### Stopping Services

```bash
# Stop all services (keep data)
docker compose down

# Stop and remove volumes (DELETE ALL DATA)
docker compose down -v

# Stop specific service
docker compose stop db
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f db
docker compose logs -f app

# Last 100 lines
docker compose logs --tail=100 app
```

### Database Operations

```bash
# Run migrations
npm run db:migrate

# Open Drizzle Studio
npm run db:studio

# Connect to PostgreSQL directly
docker exec -it automaker-starter-kit-db psql -U postgres -d automaker

# Reset database (DELETE ALL DATA)
docker compose down -v
docker compose up -d
npm run db:migrate
```

### Shell Access

```bash
# Access app container shell
docker exec -it automaker-starter-kit-app sh

# Access database container
docker exec -it automaker-starter-kit-db bash

# Access Redis CLI
docker exec -it automaker-starter-kit-redis redis-cli
```

## Development Workflow

### Local Development (Recommended)

1. Start database services:
   ```bash
   docker compose up -d
   ```

2. Run the app locally with hot-reload:
   ```bash
   npm run dev
   ```

3. Make changes - the app auto-reloads

### Full Docker Development

1. Start all services:
   ```bash
   docker compose --profile full up -d
   ```

2. View app logs:
   ```bash
   docker compose logs -f app
   ```

3. Changes to source code trigger hot-reload inside the container

### Running Stripe Webhook Locally

```bash
# In a separate terminal
npm run stripe:listen
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :5432

# Change the port in .env
DB_PORT=5433
```

### Container Won't Start

```bash
# Check container logs
docker compose logs db

# Check container status
docker compose ps

# Restart specific container
docker compose restart db
```

### Database Connection Issues

```bash
# Verify database is healthy
docker compose ps

# Check if database accepts connections
docker exec automaker-starter-kit-db pg_isready

# Verify environment variables
docker compose config
```

### Resetting Everything

```bash
# Stop all containers and remove volumes
docker compose down -v

# Remove unused Docker resources
docker system prune -a

# Start fresh
docker compose up -d
```

### Hot Reload Not Working

1. Ensure you're using the `full` profile:
   ```bash
   docker compose --profile full up -d
   ```

2. Check volume mounts:
   ```bash
   docker compose config | grep volumes -A 10
   ```

3. On Windows, ensure Docker has access to your drive in Docker Desktop settings

## Platform-Specific Notes

### macOS

- Docker Desktop is recommended
- Enable "Use Rosetta for x86/amd64 emulation" on Apple Silicon for better compatibility
- File watching works natively

### Windows

- Use WSL 2 backend for best performance
- Store project files in WSL filesystem (`\\wsl$\Ubuntu\...`) for faster file I/O
- If using PowerShell, commands are the same

### Linux

- Add your user to the `docker` group to avoid using `sudo`:
  ```bash
  sudo usermod -aG docker $USER
  ```
- For file permission issues, ensure Docker has access to your project directory

## Data Persistence

Data is persisted in Docker volumes:

- `automaker-postgres-data`: PostgreSQL data
- `automaker-redis-data`: Redis data
- `automaker-vite-cache`: Vite build cache

To list volumes:
```bash
docker volume ls | grep automaker
```

To backup data:
```bash
docker exec automaker-starter-kit-db pg_dump -U postgres automaker > backup.sql
```

To restore data:
```bash
cat backup.sql | docker exec -i automaker-starter-kit-db psql -U postgres automaker
```

## Health Checks

The following services have health checks configured:

- **PostgreSQL**: Checks if the database accepts connections
- **Redis**: Pings the Redis server

View health status:
```bash
docker compose ps
```

Services dependent on `db` and `redis` will wait for them to be healthy before starting.
