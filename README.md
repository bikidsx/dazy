# Debu 🐳

> Make Docker as easy as running `npm install` - intuitive, fast, and shareable.

```
██████╗ ███████╗██████╗ ██╗   ██╗
██╔══██╗██╔════╝██╔══██╗██║   ██║
██║  ██║█████╗  ██████╔╝██║   ██║
██║  ██║██╔══╝  ██╔══██╗██║   ██║
██████╔╝███████╗██████╔╝╚██████╔╝
╚═════╝ ╚══════╝╚═════╝  ╚═════╝ 
```

**Debu** is a developer-first terminal UI for Docker that goes beyond monitoring to actively help you set up, share, and manage containerized environments. Unlike existing tools, Debu focuses on workflow automation, template management, and team collaboration.

## 🎯 Why Debu?

### The Problem

**Docker CLI is powerful but tedious:**
- Commands are verbose and hard to remember
- No visual feedback or easy exploration
- Difficult to manage multiple containers simultaneously

**Docker Desktop is heavy:**
- Uses 1-2GB RAM constantly
- Electron-based, slow startup
- Doesn't work over SSH
- Overkill for terminal-focused developers

**Existing TUIs are monitoring-focused:**
- Great for viewing, weak for creating
- No template or configuration management
- Limited Docker Compose support
- Can't save and share setups

**Team onboarding is painful:**
- "Works on my machine" syndrome
- Long setup docs that get outdated
- Manual container configuration
- No easy way to share working environments

### The Solution

Debu solves these problems with:

1. **Template System** - Save any container configuration and reuse it instantly. Share templates with your team via JSON files.

2. **First-Class Compose Support** - Manage multi-container applications with an intuitive interface. Auto-detect compose files and control services interactively.

3. **Keyboard-Driven Workflow** - Navigate everything with your keyboard. Fast, efficient, and works perfectly over SSH.

4. **Lightweight & Fast** - Built with Bun. Minimal resource usage, instant startup. No Electron bloat.

## ✨ Features

### 🎯 Template System ✅

**The Problem:** Setting up databases, caches, and services is repetitive. You configure Postgres once, then do it again on every project.

**The Solution:** Templates let you save any container configuration and reuse it instantly.

- **Save from Running Containers** - Convert any container to a reusable template
- **10+ Built-in Templates** - Postgres, MySQL, MongoDB, Redis, Nginx, RabbitMQ, Elasticsearch, MinIO, Mailhog
- **Variable Substitution** - Prompt for passwords, ports, and other values when running templates
- **Import/Export** - Share templates with your team as JSON files
- **One Command Setup** - `debu templates → Run → postgres` - Done in 10 seconds

### 📄 Docker Compose Integration ✅

**The Problem:** Managing multi-container apps with docker-compose commands is clunky.

**The Solution:** First-class Compose support with interactive management.

- **Auto-Detection** - Automatically finds compose files in your project
- **Service Overview** - See all services, their status, and ports at a glance
- **Interactive Actions** - Up, down, restart, logs, build with keyboard navigation
- **Per-Service Control** - Restart just the web server, view logs for just the database
- **Validation** - Check compose file syntax before running

### 📦 Container Management ✅

- **List & Filter** - See all containers with status, uptime, ports
- **Quick Actions** - Start, stop, restart, remove with keyboard shortcuts
- **Logs Viewer** - View logs with timestamps and follow mode
- **Shell Access** - Execute into containers with automatic shell detection

### 🖼️ Image, Volume & Network Management ✅

- **Images** - List, pull, remove images with progress indicators
- **Volumes** - Create, list, remove volumes with safety checks
- **Networks** - Create custom networks, connect/disconnect containers

## 🚀 Installation

### Prerequisites

- Docker daemon running

### Install via npm

```bash
npm install -g debu
```

### Install via bun

```bash
bun install -g debu
```

Then run:

```bash
debu
```

## 📖 Usage

Launch Debu and navigate with your keyboard:

```bash
debu
```

### Common Workflows

**� Qusick Database Setup**
```bash
debu
→ Templates → Run Template → postgres
→ Enter password: ****
→ Container running on localhost:5432
```

**💾 Save Your Setup**
```bash
debu
→ Templates → Save from Container
→ Select your container → Name it
→ Template saved! Reuse on any project
```

**📤 Share with Team**
```bash
debu
→ Templates → Export Template
→ Output: ./postgres-setup.debu.json
# Share this file with your team
```

**📄 Manage Compose Stack**
```bash
cd my-app && debu
→ Compose Projects
→ Up / Down / Logs / Restart
```

## �S️ Roadmap

### ✅ Phase 1: Core Docker Management (Complete)
Fast, keyboard-driven container, image, volume, and network management.

### ✅ Phase 2: Templates & Compose (Complete)
Save containers as templates, 10+ built-in templates, first-class Compose support.

### 🚧 Phase 3: Multi-Environment (Next)
SSH tunnels, context switching, environment comparison.

### 📋 Phase 4: Developer Experience (Planned)
Auto-detect project type, suggest services, quick setup wizards.

### 🎨 Phase 5: Polish (Planned)
Live stats dashboard, cleanup automation, registry browser, themes.


## � DocumCentation

- [Template System Guide](./docs/TEMPLATES.md)
- [Docker Compose Guide](./docs/COMPOSE.md)
- [Changelog](./CHANGELOG.md)

## 📄 License

MIT License - see [LICENSE](./LICENSE)

