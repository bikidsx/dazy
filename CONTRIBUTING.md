# Contributing to Debu

Thanks for your interest in contributing to Debu! This guide will help you get started.

## Development Setup

1. **Prerequisites**
   - [Bun](https://bun.sh) 1.0+
   - Docker daemon running
   - Git

2. **Clone and Install**
   ```bash
   git clone https://github.com/yourusername/debu.git
   cd debu
   bun install
   ```

3. **Run in Development**
   ```bash
   bun run dev
   ```

## Project Structure

```
debu/
├── src/
│   ├── cli/              # CLI commands and entry point
│   ├── core/             # Core Docker client logic
│   ├── ui/               # UI components (tables, lists)
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript type definitions
├── tests/                # Test files
└── dist/                 # Build output
```

## Development Workflow

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add tests for new features
   - Update documentation

3. **Test your changes**
   ```bash
   bun test
   bun run dev
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style

- Use TypeScript for all code
- Follow existing naming conventions
- Use async/await for asynchronous code
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Run `bun test` to execute tests

## Commit Messages

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

## Questions?

Open an issue or discussion on GitHub!
