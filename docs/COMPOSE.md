# Docker Compose Guide

Debu provides first-class support for Docker Compose, making it easy to manage multi-container applications.

## Features

- 🔍 **Auto-detection** - Automatically finds compose files in current directory
- 📊 **Service Overview** - View all services with status and ports
- 🎮 **Interactive Management** - Up, down, restart, logs, build
- ✅ **Validation** - Check compose file syntax
- 📋 **Per-Service Actions** - Manage individual services

## Quick Start

```bash
cd your-project-with-compose-file
bun run dev compose
```

Debu will:
1. Detect `docker-compose.yml` (or variants)
2. Show all services with their status
3. Provide interactive menu for actions

## Supported Compose Files

Debu looks for these files (in order):
- `docker-compose.yml`
- `docker-compose.yaml`
- `compose.yml`
- `compose.yaml`

## Available Actions

### Up - Start Services

Starts all services defined in the compose file.

**Options:**
- Build images before starting
- Force recreate containers
- Remove orphaned containers

```bash
# Interactive
bun run dev compose → Up

# With options
Select: Build images ✓
Select: Force recreate ✓
```

### Down - Stop Services

Stops and removes all containers.

**Options:**
- Remove volumes (⚠️ deletes data!)

```bash
bun run dev compose → Down
Remove volumes? No
```

### Restart

Restart all services or a specific service.

```bash
bun run dev compose → Restart
Restart: [All services] or [specific service]
```

### Logs

View logs from all services or a specific service.

**Options:**
- Follow logs (live tail)
- View specific service only

```bash
bun run dev compose → Logs
View logs for: [All services]
Follow logs? Yes
```

### Pull Images

Pull latest images for all services.

```bash
bun run dev compose → Pull
# Downloads latest versions
```

### Build

Build or rebuild services.

```bash
bun run dev compose → Build
Build: [All services] or [specific service]
```

### Validate

Check compose file syntax and structure.

```bash
bun run dev compose → Validate
✓ Compose file is valid
```

## Example Compose File

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=myapp
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  pgdata:
  redis-data:
```

## Service Status Display

When you open a compose project, Debu shows:

```
📄 my-app

Services (3):
STATUS  SERVICE    STATE     PORTS
▶️      web        running   0.0.0.0:3000→3000
▶️      postgres   running   0.0.0.0:5432→5432
▶️      redis      running   0.0.0.0:6379→6379
```

## Common Workflows

### Development Workflow

```bash
# Start your stack
cd project
bun run dev compose → Up

# Make code changes...

# Rebuild and restart
bun run dev compose → Build → web
bun run dev compose → Restart → web

# View logs
bun run dev compose → Logs → web → Follow

# Stop everything
bun run dev compose → Down
```

### Debugging Services

```bash
# View logs for specific service
bun run dev compose → Logs → postgres

# Restart problematic service
bun run dev compose → Restart → postgres

# Check if compose file is valid
bun run dev compose → Validate
```

### Team Onboarding

```bash
# New team member clones repo
git clone project
cd project

# Start entire stack
bun run dev compose → Up

# Everything runs!
```

## Tips & Best Practices

### 1. Use .env Files

```yaml
services:
  web:
    environment:
      - DB_PASSWORD=${DB_PASSWORD}
```

Create `.env` file:
```
DB_PASSWORD=secret123
```

### 2. Health Checks

```yaml
services:
  postgres:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### 3. Depends On

```yaml
services:
  web:
    depends_on:
      postgres:
        condition: service_healthy
```

### 4. Named Volumes

Use named volumes for data persistence:
```yaml
volumes:
  pgdata:
  redis-data:
```

### 5. Networks

Isolate services with custom networks:
```yaml
networks:
  frontend:
  backend:

services:
  web:
    networks:
      - frontend
      - backend
  postgres:
    networks:
      - backend
```

## Troubleshooting

### Compose file not detected

Make sure you're in the directory with the compose file:
```bash
ls docker-compose.yml  # Should exist
bun run dev compose
```

### Services won't start

Check logs:
```bash
bun run dev compose → Logs → [service]
```

Validate compose file:
```bash
bun run dev compose → Validate
```

### Port conflicts

If ports are already in use, modify your compose file:
```yaml
ports:
  - "5433:5432"  # Use different host port
```

### Volumes not persisting

Make sure you're using named volumes:
```yaml
volumes:
  - pgdata:/var/lib/postgresql/data  # Named volume

volumes:
  pgdata:  # Define volume
```

## Integration with Templates

You can combine Compose with Templates:

1. **Start with Compose** - Use compose for your main app
2. **Add services via Templates** - Add one-off services like mailhog
3. **Save working setup** - Export containers as templates

Example:
```bash
# Start main app with compose
bun run dev compose → Up

# Add email testing
bun run dev templates → Run → mailhog

# Now you have app + mailhog running
```

## Advanced Usage

### Multiple Compose Files

If you have multiple compose files:
```bash
bun run dev compose
# Select which file to use
```

### Environment-Specific Configs

```yaml
# docker-compose.yml (base)
services:
  web:
    image: myapp

# docker-compose.override.yml (dev)
services:
  web:
    environment:
      - DEBUG=true
```

Docker Compose automatically merges these files.

## Keyboard Shortcuts

When in compose view:
- `↑/↓` - Navigate options
- `Enter` - Select action
- `Space` - Toggle checkboxes
- `Ctrl+C` - Cancel/Exit

## Next Steps

- Learn about [Templates](./TEMPLATES.md) for single-container setups
- See [PRODUCT.md](../PRODUCT.md) for full feature roadmap
- Check [README.md](../README.md) for installation and basics
