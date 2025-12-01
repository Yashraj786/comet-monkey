#!/usr/bin/env node

/**
 * comet-monkey-unified.js
 * Main test runner using Config, Smart Interactions, and HTML Reports
 * 
 * Usage:
 *   npx comet-monkey                              # Use defaults
 *   npx comet-monkey --config comet-monkey.yml    # Use config file
 *   BASE_URL=https://example.com npx comet-monkey # Override base URL
 */

const { chromium, firefox, webkit } = require('playwright');
const ConfigLoader = require('../lib/config-loader');
const SmartInteractionEngine = require('../lib/smart-interaction-engine');
const HTMLReportGenerator = require('../lib/html-report-generator');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Parse command line arguments
const args = process.argv.slice(2);
let configPath = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--config' && args[i + 1]) {
    configPath = args[i + 1];
  }
}

// Load configuration
let config;
try {
  config = ConfigLoader.load(configPath);
  console.log('✅ Configuration loaded successfully\n');
} catch (error) {
  console.error(`❌ Failed to load configuration: ${error.message}`);
  process.exit(2);
}

const report = {
  timestamp: new Date().toISOString(),
  results: [],
  errors: [],
  warnings: [],
  screenshots: [],
  total: 0,
  passed: 0,
  failed: 0
};

async function logTest(name, passed, details = '') {
  const entry = { name, passed, timestamp: new Date().toISOString(), details };
  report.results.push(entry);
  report.total++;
  if (passed) {
    report.passed++;
    console.log(`✓ ${name}${details ? ` - ${details}` : ''}`);
  } else {
    report.failed++;
    console.log(`✗ ${name}${details ? ` - ${details}` : ''}`);
  }
}

async function logError(error) {
  report.errors.push({ message: error, timestamp: new Date().toISOString() });
  console.error(`✗ Error: ${error}`);
}

async function saveScreenshot(page, filename) {
  try {
    const filepath = path.join(config.report.output_dir, filename);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(config.report.output_dir)) {
      fs.mkdirSync(config.report.output_dir, { recursive: true });
    }
    
    await page.screenshot({ path: filepath });
    report.screenshots.push(filename);
  } catch (error) {
    await logError(`Failed to save screenshot: ${error.message}`);
  }
}

async function runTestsForBrowser(browser, browserName, pages = []) {
  console.log(`\n🌐 Testing on ${browserName.toUpperCase()}`);
  console.log('═'.repeat(50));

  const browserInstance = await browser.launch();
  const context = await browserInstance.newContext();
  const page = await context.newPage();

  // Setup logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      report.warnings.push({ type: 'console_error', message: msg.text() });
    }
  });

  page.on('requestfailed', request => {
    report.warnings.push({
      type: 'network_error',
      url: request.url(),
      error: request.failure().errorText
    });
  });

  try {
    // Test each page
    for (const pageUrl of pages) {
      console.log(`\n📄 Testing: ${pageUrl}`);

      try {
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: config.testing.timeout });
        await logTest(`Page loads (${browserName})`, true, pageUrl);
        await saveScreenshot(page, `${browserName}-page-${pages.indexOf(pageUrl)}.png`);
      } catch (error) {
        await logTest(`Page loads (${browserName})`, false, error.message);
        continue;
      }

      // Run smart interactions
      try {
        const engine = new SmartInteractionEngine(config.testing);
        const results = await engine.runInteractions(page, config.testing.max_interactions);
        await logTest(`Smart interactions (${browserName})`, true, `${results.interactions_performed} interactions`);
      } catch (error) {
        await logTest(`Smart interactions (${browserName})`, false, error.message);
      }

      await sleep(500);
    }
  } catch (error) {
    await logError(`Critical error during testing on ${browserName}: ${error.message}`);
  } finally {
    await context.close();
    await browserInstance.close();
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║          🐵 comet-monkey Unified Test Runner            ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\nConfiguration:`);
  console.log(`  Base URL: ${config.testing.base_url}`);
  console.log(`  Browsers: ${config.browser.browsers.join(', ')}`);
  console.log(`  Max Interactions: ${config.testing.max_interactions}`);
  console.log(`  Tests: ${config.tests.enabled.join(', ')}`);
  console.log(`  Report Dir: ${config.report.output_dir}`);
  console.log(`  Report Formats: ${config.report.format.join(', ')}`);

  const startTime = Date.now();

  try {
    // Test pages
    const pages = [
      config.testing.base_url,
      config.testing.base_url + '/login',
      config.testing.base_url + '/nonexistent-page-12345'
    ];

    // Test on each browser
    const browserMap = {
      'chromium': chromium,
      'firefox': firefox,
      'webkit': webkit
    };

    for (const browserName of config.browser.browsers) {
      if (browserMap[browserName]) {
        try {
          await runTestsForBrowser(browserMap[browserName], browserName, pages);
        } catch (error) {
          await logError(`Failed to run tests on ${browserName}: ${error.message}`);
        }
      } else {
        console.log(`⚠️  Browser not supported: ${browserName}`);
      }
    }

    // Summary
    const duration = Date.now() - startTime;
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                    TEST SUMMARY                         ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`Total Tests: ${report.total}`);
    console.log(`Passed: ${report.passed} ✓`);
    console.log(`Failed: ${report.failed} ✗`);
    console.log(`Pass Rate: ${report.total > 0 ? Math.round((report.passed / report.total) * 100) : 0}%`);
    console.log(`Duration: ${duration}ms`);

    if (report.warnings.length > 0) {
      console.log(`\nWarnings: ${report.warnings.length}`);
      report.warnings.slice(0, 5).forEach(w => {
        console.log(`  - ${w.type}: ${w.message || w.error}`);
      });
      if (report.warnings.length > 5) {
        console.log(`  ... and ${report.warnings.length - 5} more`);
      }
    }

    if (report.errors.length > 0) {
      console.log(`\nErrors: ${report.errors.length}`);
      report.errors.forEach(e => {
        console.log(`  - ${e.message}`);
      });
    }

    // Save reports
    console.log('\n📊 Saving Reports...');

    // Save JSON report
    if (config.report.format.includes('json')) {
      const jsonPath = path.join(config.report.output_dir, 'report.json');
      if (!fs.existsSync(config.report.output_dir)) {
        fs.mkdirSync(config.report.output_dir, { recursive: true });
      }
      fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
      console.log(`✓ JSON report saved to: ${jsonPath}`);
    }

    // Save HTML report
    if (config.report.format.includes('html')) {
      const generator = new HTMLReportGenerator();
      const htmlPath = path.join(config.report.output_dir, 'report.html');
      generator.saveReport(report, htmlPath);
    }

    console.log('\n✅ All tests completed!\n');

    // Exit with appropriate code
    process.exit(report.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(2);
  }
}

// Run tests
main().catch(error => {
  console.error(`Unexpected error: ${error.message}`);
  process.exit(2);
});
