# Dazy

A terminal UI for Docker that actually helps you get things done.

```
 ██████╗  █████╗ ███████╗██╗   ██╗        .
 ██╔══██╗██╔══██╗╚══███╔╝╚██╗ ██╔╝       ":"
 ██║  ██║███████║  ███╔╝  ╚████╔╝      ___:____     |"\/"|
 ██║  ██║██╔══██║ ███╔╝    ╚██╔╝     ,'        `.    \  /
 ██████╔╝██║  ██║███████╗   ██║     |  O        \___/  |
 ╚═════╝ ╚═╝  ╚═╝╚══════╝   ╚═╝   ~^~^~^~^~^~^~^~^~^~^~^~^~
```

## What is this?

Dazy is a keyboard-driven Docker manager for developers who live in the terminal. It's not just another monitoring tool - it helps you save container setups as templates, manage Compose projects, and share configurations with your team.

## Installation

```bash
npm install -g dazy
```

Requires Docker to be running.

## Quick start

```bash
dazy
```

Navigate with arrow keys, select with Enter. That's it.

## Features

**Templates** - Save any container as a reusable template. Need Postgres for a new project? Run the template, enter a password, done. No more googling docker run commands.

**Compose support** - Auto-detects compose files in your project. Start, stop, restart services, view logs - all from one interface.

**Live stats** - Watch CPU, memory, and network usage in real-time for any running container.

**The basics** - Start, stop, restart, remove containers. View logs, exec into shells. Pull images, manage volumes and networks.

## Built-in templates

Postgres, MySQL, MongoDB, Redis, Nginx, RabbitMQ, Elasticsearch, MinIO, Mailhog - ready to run with sensible defaults.

## Usage examples

**Spin up a database:**
```
dazy → Templates → postgres → enter password → running on :5432
```

**Save your setup:**
```
dazy → Templates → Save from Container → pick one → name it → done
```

**Share with team:**
```
dazy → Templates → Export → postgres-setup.dazy.json
```

**Manage compose stack:**
```
cd my-app && dazy → Compose → up/down/logs/restart
```

## Linux permissions

On Linux, if you get a permission error, Dazy will offer to run with sudo. For a permanent fix:

```bash
sudo usermod -aG docker $USER
# then log out and back in
```

## Roadmap

- [x] Container, image, volume, network management
- [x] Template system with built-in templates
- [x] Docker Compose integration
- [x] Live container stats
- [ ] Multi-environment support (SSH to remote Docker)
- [ ] Project detection and setup wizards


## Docs

- [Templates guide](./docs/TEMPLATES.md)
- [Compose guide](./docs/COMPOSE.md)
- [Changelog](./CHANGELOG.md)

## License

MIT
