# Contributing to comet-monkey

Thank you for your interest in contributing! We welcome contributions from everyone.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## How to Contribute

### Reporting Bugs

Found a bug? Please open an issue with:

1. **Clear description** - What happened?
2. **Reproduction steps** - How to reproduce it?
3. **Expected behavior** - What should happen?
4. **Actual behavior** - What actually happened?
5. **Environment** - Node version, OS, etc.
6. **Screenshots/logs** - If applicable

**Example:**
```
Title: Extended session crashes when BASE_URL is invalid

Description:
When I provide an invalid BASE_URL, the extended session script crashes 
instead of gracefully handling the error.

Steps to reproduce:
1. Set BASE_URL to "http://invalid-domain-12345.example.com"
2. Run: npm run test:extended
3. See error after 10 seconds

Expected: Should log error and exit gracefully
Actual: Unhandled exception crash

Environment:
- Node v18.0.0
- macOS 13.2
- comet-monkey v1.0.0
```

### Suggesting Enhancements

Have an idea? Open an issue with:

1. **Clear title** - What feature?
2. **Motivation** - Why is this useful?
3. **Proposed solution** - How should it work?
4. **Alternatives** - Other approaches considered?

**Example:**
```
Title: Add support for custom selectors to exclude from testing

Motivation:
When testing legacy applications with very large forms, the interactive 
test script clicks every element, which can be slow. Being able to 
exclude certain elements would speed this up.

Proposed solution:
Add a CONFIG.EXCLUDE_SELECTORS array that can filter out elements 
like ['.internal-only', '[data-test-ignore]'].

Alternative:
Could also add a CONFIG.INCLUDE_SELECTORS to whitelist only certain areas.
```

### Submitting Pull Requests

1. **Fork** the repository
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** with clear commit messages
4. **Test your changes** thoroughly
5. **Push to your fork** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request** with a clear description

**PR Description Template:**
```markdown
## Description
Brief description of your changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
How did you test this? What should reviewers check?

## Checklist
- [ ] Code follows project style
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Tested on multiple environments

## Related Issues
Closes #123
```

## Development Setup

```bash
# Clone your fork
git clone https://github.com/Yashraj786/comet-monkey.git
cd comet-monkey

# Install dependencies
npm install

# Run tests
npm run test:all

# Test your changes
BASE_URL=http://your-test-site npm run test:basic
```

## Code Style

- **Indentation**: 2 spaces
- **Line length**: 100 characters (soft limit)
- **Quotes**: Single quotes `'`
- **Semicolons**: Always use them
- **Comments**: Clear and concise

**Example:**
```javascript
// Good
const testSuite = async (url) => {
  const config = {
    timeout: 30000,
    retry: 3
  };
  
  return runTests(url, config);
};

// Bad
const test_suite=(url)=>{let c={t:30000,r:3};return runTests(url,c)}
```

## Commit Messages

Use clear, descriptive commit messages:

```
feat: Add AI-powered bug report generation
fix: Handle timeout errors in extended sessions
docs: Update README with troubleshooting section
perf: Optimize element discovery by 40%
refactor: Simplify network analysis code
test: Add test cases for interactive flows
```

Format: `<type>: <subject>`

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (not functionality)
- `refactor` - Code refactoring
- `perf` - Performance improvement
- `test` - Test additions/changes
- `ci` - CI/CD changes

## Testing Requirements

Before submitting:

1. **Run all tests**: `npm run test:all`
2. **Test on different sites**: At least 2 different URLs
3. **Check for errors**: Review console output
4. **Verify reports**: Check generated JSON reports
5. **Test edge cases**: Invalid URLs, timeouts, etc.

## Documentation

Update documentation when:

- Adding new features
- Changing behavior
- Fixing confusing parts
- Adding new configuration options

Places to update:
- `README.md` - User-facing documentation
- `CONTRIBUTING.md` - This file
- Code comments - Complex logic

## Project Structure

```
comet-monkey/
├── src/
│   ├── comet-monkey.js              # Basic health checks
│   ├── comet-monkey-detailed.js     # Network analysis
│   ├── comet-monkey-interactive.js  # User flow testing
│   └── comet-monkey-extended.js     # Long-duration session
├── examples/
│   ├── basic-config.js              # Configuration examples
│   ├── custom-headers.js            # Authentication examples
│   └── ci-integration.yaml          # CI/CD integration
├── README.md                        # Main documentation
├── CONTRIBUTING.md                  # This file
├── LICENSE                          # MIT License
└── package.json                     # Project configuration
```

## Areas for Contribution

### High Priority
- [ ] Cloud dashboard (freemium feature)
- [ ] CI/CD integration helpers
- [ ] Performance optimizations
- [ ] Better error messages

### Medium Priority
- [ ] Additional test frameworks (support for Cypress, WebDriverIO)
- [ ] Report visualization
- [ ] Custom plugin system
- [ ] API documentation

### Low Priority (Nice to Have)
- [ ] Language translations
- [ ] Additional examples
- [ ] Video tutorials
- [ ] Community tools

## Questions?

- Open a GitHub Discussion
- Email the maintainers
- Check existing issues and PRs

## Recognition

Contributors will be:
- Listed in README
- Mentioned in release notes
- Credited in documentation

Thank you for making comet-monkey better! 🐵
