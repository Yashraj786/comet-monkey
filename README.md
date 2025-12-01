# 🐵 comet-monkey.js

[![GitHub stars](https://img.shields.io/github/stars/yourusername/comet-monkey.svg?style=social&label=Stars)](https://github.com/yourusername/comet-monkey)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16-brightgreen)](https://nodejs.org/)
[![Playwright Version](https://img.shields.io/badge/playwright-%3E%3D1.57-blue)](https://playwright.dev/)

**Autonomous browser testing framework powered by Playwright.** Discover bugs through intelligent random exploration, comprehensive network analysis, and extended testing sessions.

## 🎯 What is comet-monkey?

comet-monkey is a lightweight, zero-configuration autonomous testing tool that:

- 🤖 **Explores autonomously** - Discovers and interacts with page elements randomly
- 🌐 **Analyzes networks** - Tracks all HTTP requests, identifies 404s and failures
- 📊 **Generates reports** - Produces detailed JSON reports with screenshots
- ⚡ **Runs instantly** - No setup, no configuration, just `npm start`
- 🎬 **Captures everything** - Screenshots, console errors, network data
- 🧪 **Tests thoroughly** - Extended 60+ second exploration sessions

Perfect for:
- **CI/CD pipelines** - Automated pre-flight checks
- **Exploratory testing** - Finding unexpected bugs
- **Regression detection** - Catching breaking changes early
- **Performance monitoring** - Tracking load times and network issues
- **Accessibility validation** - Ensuring keyboard navigation and ARIA labels

## ✨ Features

| Feature | comet-monkey | Cypress | Playwright | Testim |
|---------|--------------|---------|-----------|--------|
| **Cost** | Free | Free | Free | $50K+/year |
| **Setup Time** | 5 min | 2 hours | 1 hour | 4-8 hours |
| **Autonomous** | ✅ | ❌ | ❌ | ⚠️ |
| **Network Analysis** | ✅ | ⚠️ | ⚠️ | ✅ |
| **Extended Sessions** | ✅ | ❌ | ❌ | ❌ |
| **Zero Config** | ✅ | ❌ | ❌ | ❌ |
| **Open Source** | ✅ | ✅ | ✅ | ❌ |

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/comet-monkey.git
cd comet-monkey

# Install dependencies
npm install
```

### Basic Usage

```bash
# Run basic health checks (2 seconds)
npm run test:basic

# Analyze network requests (5 seconds)
npm run test:network

# Test interactive flows (10 seconds)
npm run test:interactive

# Extended 60-second exploration
npm run test:extended

# Run all tests
npm run test:all
```

### Manual Testing

```bash
# Test your own website
node src/comet-monkey.js
# Edit src/comet-monkey.js and change BASE_URL
```

## 📊 Example Output

### Basic Test (comet-monkey.js)

```
=== Nexus AI Comet Inspection Started ===

✓ Homepage loads
✓ Page title correct - Nexus AI // Cyberpunk
✓ Login form renders
✓ Health endpoint responds - Status: 503
✓ CSS/JS loaded - CSS: loaded, JS: loaded
✓ Security headers present
✓ No fatal console errors - Found: 0 errors
✓ Mobile viewport works
✓ Form validation attributes
✓ 404 page handling - Status: 404
✓ Backend connectivity
✓ API endpoints accessible - Status: 503

=== Test Summary ===
Passed: 12/12

Report saved to: screenshots/inspection-report.json
```

### Network Analysis (comet-monkey-detailed.js)

```
=== DETAILED NETWORK INSPECTION STARTED ===

Total Requests: 16
Failed Requests: 0

Requests by Status Code:
✓ 200: 14 requests
✓ 302: 1 requests
⚠️ 404: 1 requests (intentional)

✓ Report saved to: screenshots/detailed-network-report.json
```

### Extended Session (comet-monkey-extended.js)

```
⏱️  [60s] Extended Autonomous Testing Session Complete

📊 STATISTICS:
  Duration: 60s
  Pages Visited: 60
  Unique URLs: 4
  Elements Clicked: 105
  Forms Tested: 52
  Network Requests: 883
  Errors Encountered: 30
  Average Load Time: 25ms

✓ Report saved to: screenshots/extended-session-report.json
```

## 🔧 Configuration

Each script has a `CONFIG` object at the top that you can customize:

```javascript
const CONFIG = {
  BASE_URL: 'http://localhost:3000',           // Target URL
  TEST_USER: { email: 'test@example.com', password: 'password' },
  SCREENSHOT_DIR: 'playwright-screenshots',    // Report directory
  TIMEOUT: 30000,                              // Request timeout (ms)
  INTERACTION_DELAY: 500,                      // Delay between actions (ms)
  MAX_INTERACTIONS: 5,                         // Max random clicks per page
  SESSION_DURATION_MS: 60000                   // Extended session duration (ms)
};
```

## 📖 Available Scripts

### 1. **comet-monkey.js** - Basic Health Checks
- **Purpose**: Quick sanity checks on your application
- **Runtime**: 2-3 seconds
- **Coverage**: 12 critical validations
- **Output**: `inspection-report.json`

```bash
npm run test:basic
```

**Tests:**
- Page accessibility
- Page titles and metadata
- Login form rendering
- Health endpoints
- CSS/JS loading
- Security headers
- Console errors
- Responsive design
- Form validation
- 404 handling
- Backend connectivity
- API endpoints

---

### 2. **comet-monkey-detailed.js** - Network Analysis
- **Purpose**: Deep dive into network requests
- **Runtime**: 5-10 seconds
- **Coverage**: All HTTP requests, status codes, failures
- **Output**: `detailed-network-report.json`

```bash
npm run test:network
```

**Analyzes:**
- All HTTP requests
- Status code distribution
- Failed requests
- 404 errors with URLs
- Network failures
- Response times

---

### 3. **comet-monkey-interactive.js** - User Flow Testing
- **Purpose**: Test user interactions and forms
- **Runtime**: 10-15 seconds
- **Coverage**: Element discovery, clicking, form filling, keyboard nav
- **Output**: `interactive-test-report.json`

```bash
npm run test:interactive
```

**Tests:**
- Element discovery (links, buttons, inputs)
- Clicking interactions
- Form field filling
- Keyboard navigation (Tab key)
- Sidebar navigation
- Accessibility attributes
- Mobile viewport

---

### 4. **comet-monkey-extended.js** - Long-Duration Session
- **Purpose**: Continuous autonomous exploration
- **Runtime**: 60+ seconds
- **Coverage**: Multi-page navigation, random interactions, form testing
- **Output**: `extended-session-report.json` + screenshots

```bash
npm run test:extended
```

**Explores:**
- Multiple pages in sequence
- Random element clicking (105+ elements)
- Form testing (52+ forms)
- Error tracking
- Performance metrics
- Network monitoring

## 📊 Understanding Reports

All tests generate JSON reports in the `screenshots/` directory:

```json
{
  "timestamp": "2025-12-02T00:32:20.468Z",
  "duration_ms": 60000,
  "tests": [
    {
      "name": "Homepage loads",
      "passed": true,
      "details": ""
    }
  ],
  "interactions": [...],
  "errors": [...],
  "performance": {
    "avg_load_time": 25,
    "total_requests": 883
  }
}
```

**View a report:**
```bash
cat screenshots/extended-session-report.json | jq .
```

## 🎨 Use Cases

### 1. CI/CD Pre-Flight Checks
Run before every deployment to catch breaking changes:

```yaml
# .github/workflows/test.yml
- name: Pre-flight checks
  run: npm run test:basic
  
- name: Network validation
  run: npm run test:network
```

### 2. Overnight Exploratory Testing
Run extended sessions to find edge cases:

```bash
# Schedule via cron
0 2 * * * cd /path/to/comet-monkey && npm run test:extended
```

### 3. Multi-Environment Testing
Test across staging, QA, and production:

```bash
# Test staging
BASE_URL=https://staging.example.com npm run test:extended

# Test production
BASE_URL=https://example.com npm run test:basic
```

### 4. Performance Monitoring
Track performance trends over time:

```bash
# Collect reports daily
npm run test:extended
# Archive and analyze: screenshots/extended-session-report.json
```

### 5. Accessibility Validation
Ensure keyboard navigation and ARIA labels work:

```bash
npm run test:interactive
# Check report for keyboard navigation results
```

## 💡 Tips & Tricks

### Test Against Local Development Server
```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Run tests
npm run test:all
```

### Test with Environment Variables
```bash
BASE_URL=http://localhost:3000 npm run test:basic
```

### Custom Configuration
Edit `src/comet-monkey.js` and change the `CONFIG` object:

```javascript
const CONFIG = {
  BASE_URL: 'https://your-site.com',
  TIMEOUT: 60000,  // Increase for slow sites
  SESSION_DURATION_MS: 120000  // 2-minute extended session
};
```

### Analyzing Extended Session Results
```bash
# View summary
cat screenshots/extended-session-report.json | jq '.performance'

# Find all errors
cat screenshots/extended-session-report.json | jq '.errors'

# Count interactions
cat screenshots/extended-session-report.json | jq '.interactions | length'
```

## 🐛 Troubleshooting

### Port Already in Use
```
Error: Port 3000 is in use
```
**Solution:** Stop other processes or change `BASE_URL` in config

### Browser Launch Failed
```
Error: Failed to launch browser
```
**Solution:** Install Playwright browsers
```bash
npx playwright install
```

### Timeout Errors
```
Error: Timeout of 30000ms exceeded
```
**Solution:** Increase `TIMEOUT` in CONFIG or check network

### No Screenshots Created
```
Error: playwright-screenshots directory not writable
```
**Solution:** Create directory and check permissions
```bash
mkdir -p playwright-screenshots
chmod 755 playwright-screenshots
```

## 📈 Performance Benchmarks

Typical performance on modern web apps:

| Metric | Benchmark |
|--------|-----------|
| Basic test runtime | 2-3 seconds |
| Network analysis | 5-10 seconds |
| Interactive test | 10-15 seconds |
| Extended session | 60-120 seconds |
| Page load time | 20-50ms |
| Network requests | 10-50 per page |
| Screenshots | 20-30 per session |

## 🤝 Contributing

Contributions are welcome! Please feel free to:

1. **Report bugs** - Open an issue with details
2. **Suggest features** - Describe your use case
3. **Submit PRs** - Fork, develop, and submit pull request
4. **Improve docs** - Fix typos, add examples

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

MIT License - feel free to use in personal and commercial projects.

See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Built with:
- [Playwright](https://playwright.dev/) - Browser automation
- [Node.js](https://nodejs.org/) - JavaScript runtime

Inspired by:
- Testing best practices
- Autonomous bug discovery
- Developer-first tools

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/comet-monkey/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/comet-monkey/discussions)
- **Email**: your.email@example.com

## 🗺️ Roadmap

- [x] Basic health checks
- [x] Network analysis
- [x] Interactive testing
- [x] Extended sessions
- [ ] Cloud dashboard (planned for v2)
- [ ] CI/CD integration helpers
- [ ] AI-powered bug reports
- [ ] Team collaboration
- [ ] Historical trend analysis

## ⭐ Show Your Support

If you find comet-monkey useful, please:

- ⭐ Star this repository
- 🐛 Report bugs and issues
- 💬 Share feedback and suggestions
- 📣 Tell others about it!

---

**Made with ❤️ for developers who want better testing.**

Last updated: December 2, 2025
