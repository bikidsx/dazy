# Template System Guide

Templates in Dazy allow you to save, reuse, and share Docker container configurations. Think of them as blueprints for containers.

## What are Templates?

A template is a JSON file that describes how to create and configure a Docker container, including:
- Image to use
- Port mappings
- Volume mounts
- Environment variables
- Health checks
- Restart policies

## Built-in Templates

Dazy comes with 10+ pre-configured templates for common services:

| Template | Description | Ports |
|----------|-------------|-------|
| `postgres` | PostgreSQL 15 database | 5432 |
| `mysql` | MySQL 8 database | 3306 |
| `mongodb` | MongoDB 6 document database | 27017 |
| `redis` | Redis 7 cache | 6379 |
| `nginx` | Nginx web server | 80, 443 |
| `rabbitmq` | RabbitMQ message broker | 5672, 15672 |
| `elasticsearch` | Elasticsearch search | 9200, 9300 |
| `minio` | MinIO S3 storage | 9000, 9001 |
| `mailhog` | Email testing tool | 1025, 8025 |

## Using Templates

### Run a Template

```bash
bun run dev templates
# Select "Run Template"
# Choose template (e.g., postgres)
# Fill in variables (password, database name, etc.)
# Container is created and started!
```

### View Template Details

```bash
bun run dev templates
# Select "View Template"
# Choose template to see full configuration
```

## Creating Custom Templates

### Save from Running Container

The easiest way to create a template:

```bash
bun run dev templates
# Select "Save from Container"
# Choose a running container
# Give it a name
# Template is saved!
```

This captures:
- Image and version
- All port mappings
- Volume mounts
- Environment variables
- Restart policy

### Manual Template Creation

Create a JSON file in `~/.config/dazy/templates/` (macOS/Linux):

```json
{
  "name": "my-app",
  "description": "My custom application",
  "image": "myapp:latest",
  "ports": [
    {
      "host": 3000,
      "container": 3000,
      "protocol": "tcp"
    }
  ],
  "environment": {
    "NODE_ENV": "production",
    "PORT": "3000"
  },
  "volumes": [
    {
      "source": "app-data",
      "target": "/app/data"
    }
  ],
  "restart": "unless-stopped"
}
```

## Template Variables

Templates support variables for dynamic configuration:

```json
{
  "name": "postgres",
  "environment": {
    "POSTGRES_PASSWORD": "${DB_PASSWORD}",
    "POSTGRES_DB": "${DB_NAME}"
  },
  "variables": [
    {
      "name": "DB_PASSWORD",
      "description": "Database password",
      "required": true,
      "type": "password"
    },
    {
      "name": "DB_NAME",
      "description": "Database name",
      "default": "postgres",
      "type": "string"
    }
  ]
}
```

When running this template, Dazy will prompt for these values.

## Sharing Templates

### Export Template

```bash
bun run dev templates
# Select "Export Template"
# Choose template
# Specify output path (e.g., ./my-template.dazy.json)
```

### Import Template

```bash
bun run dev templates
# Select "Import Template"
# Enter path to template file
# Template is added to your collection
```

Share the exported JSON file with your team via:
- Git repository
- Slack/email
- Shared drive

## Template Storage

Templates are stored in:
- **macOS**: `~/Library/Preferences/dazy/templates/`
- **Linux**: `~/.config/dazy/templates/`
- **Windows**: `%APPDATA%/dazy/templates/`

Built-in templates are in the Dazy installation directory and cannot be modified.

## Best Practices

1. **Use descriptive names** - `postgres-dev` instead of `pg`
2. **Add descriptions** - Help others understand what the template does
3. **Use variables** - Make templates reusable with different configurations
4. **Tag templates** - Use tags for easy filtering
5. **Version your templates** - Include version numbers for tracking changes

## Example Workflows

### Development Database Setup

```bash
# Run postgres template
bun run dev templates → Run → postgres
# Enter password: dev123
# Enter database: myapp_dev
# Container starts on localhost:5432
```

### Team Onboarding

```bash
# Export your working setup
bun run dev templates → Export → my-dev-stack
# Share my-dev-stack.dazy.json with team

# Team member imports
bun run dev templates → Import → my-dev-stack.dazy.json
# Run template → Instant identical setup!
```

### Multi-Service Stack

Create templates for each service, then run them all:
```bash
bun run dev templates → Run → postgres
bun run dev templates → Run → redis
bun run dev templates → Run → rabbitmq
# Full stack running in seconds!
```

## Template Schema Reference

```typescript
interface Template {
  name: string                    // Required: Template identifier
  description?: string            // Optional: Human-readable description
  version?: string                // Optional: Template version
  tags?: string[]                 // Optional: Tags for categorization
  
  image: string                   // Required: Docker image
  command?: string[]              // Optional: Override CMD
  entrypoint?: string[]           // Optional: Override ENTRYPOINT
  
  ports?: PortMapping[]           // Optional: Port mappings
  volumes?: VolumeMapping[]       // Optional: Volume mounts
  networks?: string[]             // Optional: Networks to join
  
  environment?: Record<string, string>  // Optional: Environment variables
  
  restart?: 'no' | 'always' | 'unless-stopped' | 'on-failure'
  healthcheck?: HealthCheck       // Optional: Health check config
  
  variables?: Variable[]          // Optional: Prompt for values
}
```

See [PRODUCT.md](../PRODUCT.md) for complete schema details.
