/**
 * Basic Configuration Examples for comet-monkey
 * 
 * Copy these snippets to customize comet-monkey for your use case
 */

// ============================================================================
// EXAMPLE 1: Testing Your Local Development Server
// ============================================================================

const LOCAL_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  TEST_USER: { email: 'test@example.com', password: 'password' },
  SCREENSHOT_DIR: 'playwright-screenshots',
  TIMEOUT: 30000,
  INTERACTION_DELAY: 500
};

// Usage: Update CONFIG in src/comet-monkey.js with LOCAL_CONFIG


// ============================================================================
// EXAMPLE 2: Testing Slow/Remote Servers
// ============================================================================

const REMOTE_CONFIG = {
  BASE_URL: 'https://your-production-server.com',
  TEST_USER: { email: 'test@example.com', password: 'password' },
  SCREENSHOT_DIR: 'playwright-screenshots',
  TIMEOUT: 60000,  // Increase timeout for slow servers
  INTERACTION_DELAY: 1000,  // Add delay between interactions
  SESSION_DURATION_MS: 120000  // 2-minute sessions for thorough testing
};


// ============================================================================
// EXAMPLE 3: Testing Authentication-Required Pages
// ============================================================================

// Edit src/comet-monkey-interactive.js to add login before testing:

const LOGIN_BEFORE_TEST = async (page) => {
  console.log('[AUTH] Logging in...');
  
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  
  // Find and fill login form
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  const submitButton = page.locator('button[type="submit"]');
  
  if (await emailInput.count() > 0) {
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password');
    await submitButton.click();
    await page.waitForNavigation();
    console.log('[AUTH] Login successful');
  }
};


// ============================================================================
// EXAMPLE 4: Testing with Custom Headers
// ============================================================================

// Edit src/comet-monkey.js browser context setup:

const CUSTOM_HEADERS_CONFIG = async (browser) => {
  const context = await browser.newContext({
    extraHTTPHeaders: {
      'Authorization': 'Bearer YOUR_API_TOKEN',
      'X-Custom-Header': 'custom-value',
      'User-Agent': 'Custom-Test-Agent/1.0'
    }
  });
  
  return context;
};


// ============================================================================
// EXAMPLE 5: CI/CD Integration (GitHub Actions)
// ============================================================================

// File: .github/workflows/comet-monkey-tests.yml

const GITHUB_ACTIONS_WORKFLOW = `
name: Comet-Monkey Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Run nightly at 2 AM

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Start application
        run: npm run dev &
        
      - name: Wait for app to start
        run: sleep 5
      
      - name: Run comet-monkey tests
        run: npm run test:all
      
      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: comet-monkey-reports
          path: playwright-screenshots/
      
      - name: Notify on failure
        if: failure()
        run: |
          echo "Tests failed! Check artifacts for details."
          exit 1
`;


// ============================================================================
// EXAMPLE 6: Docker Integration
// ============================================================================

const DOCKERFILE = `
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src/ ./src/

RUN npx playwright install

ENV BASE_URL=http://localhost:3000

CMD ["npm", "run", "test:all"]
`;


// ============================================================================
// EXAMPLE 7: Testing Multiple Environments
// ============================================================================

const MULTI_ENV_SCRIPT = `#!/bin/bash

# Test staging
echo "Testing Staging..."
BASE_URL=https://staging.example.com npm run test:basic
cp -r playwright-screenshots playwright-screenshots-staging

# Test production
echo "Testing Production..."
BASE_URL=https://example.com npm run test:basic
cp -r playwright-screenshots playwright-screenshots-prod

# Test local
echo "Testing Local..."
BASE_URL=http://localhost:3000 npm run test:extended

echo "All environments tested!"
`;


// ============================================================================
// EXAMPLE 8: Advanced Configuration for Extended Sessions
// ============================================================================

const ADVANCED_EXTENDED_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  SCREENSHOT_DIR: 'playwright-screenshots',
  TIMEOUT: 30000,
  INTERACTION_DELAY: 300,
  MAX_PAGES_TO_TEST: 20,  // Test more pages
  SESSION_DURATION_MS: 300000,  // 5-minute session
  
  // Custom pages to test
  PAGES_TO_TEST: [
    '/',
    '/about',
    '/contact',
    '/blog',
    '/products',
    '/pricing'
  ],
  
  // Exclude certain selectors from clicking
  EXCLUDE_SELECTORS: [
    '.internal-only',
    '[data-test-ignore]',
    'button[disabled]',
    'a[href*="logout"]'
  ]
};


// ============================================================================
// EXAMPLE 9: Scheduled Testing (Cron)
// ============================================================================

const CRON_SCHEDULE = `
# Run basic tests every hour
0 * * * * cd /path/to/comet-monkey && npm run test:basic >> /var/log/comet-monkey-hourly.log 2>&1

# Run extended tests every night at 2 AM
0 2 * * * cd /path/to/comet-monkey && npm run test:extended >> /var/log/comet-monkey-nightly.log 2>&1

# Run network analysis every Monday at 9 AM
0 9 * * 1 cd /path/to/comet-monkey && npm run test:network >> /var/log/comet-monkey-weekly.log 2>&1
`;


// ============================================================================
// EXAMPLE 10: Environment Variables
// ============================================================================

const ENV_FILE = `
# .env.example

# Application URL to test
BASE_URL=http://localhost:3000

# Test user credentials
TEST_EMAIL=test@example.com
TEST_PASSWORD=password

# Playwright configuration
PLAYWRIGHT_BROWSERS_PATH=/path/to/browsers

# Screenshot directory
SCREENSHOT_DIR=playwright-screenshots

# Test timeouts (milliseconds)
TIMEOUT=30000
INTERACTION_DELAY=500

# Extended session duration (milliseconds)
SESSION_DURATION_MS=60000

# Logging level
LOG_LEVEL=info
`;


module.exports = {
  LOCAL_CONFIG,
  REMOTE_CONFIG,
  LOGIN_BEFORE_TEST,
  CUSTOM_HEADERS_CONFIG,
  ADVANCED_EXTENDED_CONFIG,
  GITHUB_ACTIONS_WORKFLOW,
  DOCKERFILE,
  MULTI_ENV_SCRIPT,
  CRON_SCHEDULE,
  ENV_FILE
};
