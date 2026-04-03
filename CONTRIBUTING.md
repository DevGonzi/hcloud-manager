# Contributing to hcloud-manager

First off, thanks for considering contributing to hcloud-manager! It's people like you that make hcloud-manager such a great tool.

## Code of Conduct

This project is committed to providing a welcoming and inspiring community for all. We ask that you follow our code of conduct in all interactions with the community.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem** in as many details as possible
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs** if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement** in as many details as possible
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior** and **the expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Follow the TypeScript and React styleguides
- Include appropriate test cases
- Update documentation as needed
- End all files with a newline

## Development Setup

### Prerequisites
- Node.js 18+
- npm or pnpm
- Git

### Getting Started

1. **Fork the repo** and clone your fork locally:
```bash
git clone https://github.com/YOUR_USERNAME/hcloud-manager.git
cd hcloud-manager
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create a feature branch:**
```bash
git checkout -b feature/my-feature
```

4. **Start development server:**
```bash
npm run dev
```

5. **Make your changes** and test thoroughly

### Building

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear and semantic commit messages:

```
type(scope): subject

body

footer
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, etc)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to build process, dependencies, etc

**Examples:**
```
feat(security): add PIN protection with 6-digit code
fix(lockscreen): resolve white page after PIN deletion
docs(readme): update installation instructions
```

## Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for new backwards-compatible features
- **PATCH** version for backwards-compatible bug fixes

When you're ready to release:
```bash
npm version patch   # 0.1.2 → 0.1.3
npm version minor   # 0.1.2 → 0.2.0
npm version major   # 0.1.2 → 1.0.0
npm run build:win
# Create GitHub Release with the .exe files
```

## Release Process

1. Update `CHANGELOG.md` with changes
2. Update version: `npm version [patch|minor|major]`
3. Build: `npm run build:win` (or other platforms)
4. Create GitHub Release:
   - Tag version created automatically by `npm version`
   - Upload built `.exe` files
   - Copy changelog entry to release notes

## Code Style

### TypeScript
- Use strict mode
- No `any` types unless absolutely necessary
- Prefer interfaces over type aliases for object shapes
- Use proper typing for React components

### React
- Functional components with hooks only
- Keep components small and focused
- Use meaningful component names
- Props should be well-typed

### CSS/Styling
- Use CSS variables for theming
- Follow existing naming conventions
- Maintain dark mode compatibility

## Branch Policy

- **main**: Production-ready code
  - Protected branch - requires PR review
  - Auto-merge enabled after approval
  - Squash-merge strategy
  - Feature branches auto-deleted on merge

- **Feature branches**: `feature/description` or `fix/description`
  - Branch off `main`
  - One feature per branch
  - Rebase before merging

## Testing

We aim for good test coverage. Before submitting a PR:

- **Run existing tests:** `npm run test` (if configured)
- **Add tests for new features**
- **Ensure all tests pass locally**

## Documentation

- Update `README.md` if adding features
- Update type definitions
- Add JSDoc comments for complex functions
- Keep CHANGELOG.md updated

## Getting Help

- Check the [README.md](README.md) for documentation
- Review existing [issues](https://github.com/DevGonzi/hcloud-manager/issues)
- Ask questions in discussions

## License

MIT. do whatever. – [gonzi](https://github.com/DevGonzi)

**Thank you for contributing!** 🚀
