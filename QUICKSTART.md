# Quick Start Guide

Get comet-monkey running in 5 minutes!

## 1️⃣ Installation (1 minute)

```bash
# Clone the repository
git clone https://github.com/yourusername/comet-monkey.git
cd comet-monkey

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

## 2️⃣ Basic Usage (1 minute)

```bash
# Run basic health checks
npm run test:basic
```

**Output:**
```
✓ Homepage loads
✓ Page title correct
✓ CSS/JS loaded
✓ Security headers present
... 8 more tests ...

Passed: 12/12
Report saved to: screenshots/inspection-report.json
```

## 3️⃣ View Results (1 minute)

```bash
# View the JSON report
cat screenshots/inspection-report.json | jq .

# Or open in your editor
open screenshots/inspection-report.json
```

## 4️⃣ Run All Tests (2 minutes)

```bash
npm run test:all
```

This runs:
1. **Basic tests** (2s) - Health checks
2. **Network analysis** (5s) - Request tracking
3. **Interactive tests** (10s) - Form and element testing
4. **Extended session** (60s) - Comprehensive exploration

## 🎯 Test Your Own Website

Edit `src/comet-monkey.js` and change the `BASE_URL`:

```javascript
const CONFIG = {
  BASE_URL: 'https://your-website.com',  // ← Change this
  ...
};
```

Then run:
```bash
npm run test:basic
```

## 📊 Understanding Reports

Each test generates a JSON report in `screenshots/`:

### Key Files
- `inspection-report.json` - Basic health checks
- `detailed-network-report.json` - Network analysis
- `interactive-test-report.json` - User flows
- `extended-session-report.json` - Full exploration

### Reading a Report
```bash
# View summary stats
cat screenshots/extended-session-report.json | jq '.performance'

# Find errors
cat screenshots/extended-session-report.json | jq '.errors'

# Count interactions
cat screenshots/extended-session-report.json | jq '.interactions | length'
```

## ⚙️ Configuration

Change how tests run by editing the `CONFIG` object:

```javascript
const CONFIG = {
  BASE_URL: 'http://localhost:3000',           // Website to test
  TIMEOUT: 30000,                              // Request timeout (ms)
  INTERACTION_DELAY: 500,                      // Delay between clicks (ms)
  SESSION_DURATION_MS: 60000,                  // Extended test duration
  SCREENSHOT_DIR: 'playwright-screenshots'     // Report directory
};
```

## 🐛 Common Issues

### "Port 3000 already in use"
```bash
# Use a different port
BASE_URL=http://localhost:3001 npm run test:basic
```

### "Browser launch failed"
```bash
# Install Playwright browsers
npx playwright install
```

### "Timeout errors"
```javascript
// Increase TIMEOUT in CONFIG
const CONFIG = {
  TIMEOUT: 60000,  // 60 seconds instead of 30
  ...
};
```

## 📚 Next Steps

1. **Read the full README** - Complete documentation
2. **Explore examples** - See more configuration options
3. **Check the docs** - Advanced usage and CI/CD integration
4. **Join discussions** - Ask questions and share ideas

## 💡 Pro Tips

### Test Multiple Environments
```bash
BASE_URL=http://localhost:3000 npm run test:basic
BASE_URL=https://staging.example.com npm run test:basic
BASE_URL=https://example.com npm run test:basic
```

### Run Overnight Tests
```bash
# Start an extended session
npm run test:extended

# Check results next morning
cat screenshots/extended-session-report.json
```

### Integrate with GitHub
See `.github/workflows/test.yml` for CI/CD integration.

### Monitor Performance
Track how your site's load times change over time:
```bash
# Run daily and archive results
npm run test:extended
mkdir -p archives/$(date +%Y-%m-%d)
cp screenshots/extended-session-report.json archives/$(date +%Y-%m-%d)/
```

## 🎓 Learning Path

### Beginner (5-10 min)
1. Run `npm run test:basic`
2. Read the output
3. Change `BASE_URL` and try your own site

### Intermediate (30 min)
1. Read full README
2. Try all 4 test types
3. Customize configuration
4. Analyze JSON reports

### Advanced (1+ hour)
1. Review example configurations
2. Set up CI/CD integration
3. Create custom test scripts
4. Contribute improvements

## 📞 Need Help?

- **Quick questions**: Check [README.md](README.md)
- **Configuration**: See `examples/` directory
- **Issues**: Open a GitHub issue
- **Discussions**: Join GitHub discussions

## 🚀 Ready for More?

- Join the community
- Star us on GitHub ⭐
- Share your experience
- Contribute improvements

---

**That's it! You're ready to test.** 🎉

For more information, see [README.md](README.md).
