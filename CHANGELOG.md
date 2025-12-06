# Changelog

All notable changes to Debu will be documented in this file.

## [0.2.0] - 2025-12-06

### Added - Phase 2: Templates & Compose

**Template System**
- Template manager for saving and reusing container configurations
- 10 built-in templates (Postgres, MySQL, MongoDB, Redis, Nginx, RabbitMQ, Elasticsearch, MinIO, Mailhog)
- Save running containers as templates
- Template variables with interactive prompts
- Import/export templates for team sharing
- Template validation and substitution

**Docker Compose Support**
- Auto-detection of compose files in current directory
- Interactive service management (up, down, restart)
- Per-service and all-services actions
- Logs viewer with follow mode
- Image pulling and building
- Compose file validation
- Service status display with ports

**UI Components**
- Template list view with custom/built-in separation
- Template detail view with full configuration
- Compose service list with status indicators
- Interactive prompts for template variables

**Storage**
- Config manager for cross-platform storage
- Template storage in user config directory
- Automatic directory creation

### Documentation
- Complete template system guide (docs/TEMPLATES.md)
- Docker Compose integration guide (docs/COMPOSE.md)
- Updated README with Phase 2 features
- Template schema reference
- Example workflows and best practices

### Tests
- Template manager unit tests
- Template loading and retrieval tests
- Increased test coverage to 8 tests

## [0.1.0] - 2025-12-01

### Added - Phase 1: MVP

**Core Docker Management**
- Container management (list, start, stop, restart, remove)
- Container logs viewer with timestamps
- Interactive shell execution in containers
- Image management (list, pull, remove)
- Volume management (create, list, remove)
- Network management (create, list, remove)

**CLI & UI**
- Interactive main menu with ASCII logo
- Command-line interface with Commander.js
- Pretty table displays with cli-table3
- Color-coded status indicators
- Spinner animations for async operations
- Docker daemon connection check

**Infrastructure**
- Docker client wrapper with dockerode
- TypeScript project structure
- Bun runtime support
- Cross-platform configuration
- Error handling and logging
- Format utilities (bytes, uptime, percentages)

**Development**
- Bun build configuration
- TypeScript compilation
- Unit tests with Bun test framework
- Prettier code formatting
- Contributing guidelines

### Documentation
- README with installation and usage
- Product requirements document (PRODUCT.md)
- Contributing guide
- MIT License

---

## Release Notes

### v0.2.0 Highlights

Phase 2 brings the power of templates and first-class Compose support to Debu:

**Templates make Docker reusable:**
- Save any container as a template with one command
- Run pre-configured services (Postgres, Redis, etc.) in seconds
- Share templates with your team via JSON files
- Variables let you customize templates on the fly

**Compose integration streamlines multi-container apps:**
- Auto-detects compose files in your project
- Interactive management of all services
- Per-service actions (restart just the web server)
- Live log following for debugging

**What's Next:**
- Phase 3: Multi-environment support (remote Docker hosts)
- Phase 4: Developer experience (project detection, integrations)
- Phase 5: Polish and advanced features

### v0.1.0 Highlights

Initial release with core Docker management:
- Complete container lifecycle management
- Image, volume, and network operations
- Interactive terminal UI
- Fast and lightweight (built with Bun)
- Keyboard-driven workflow
