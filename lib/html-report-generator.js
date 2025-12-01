const fs = require('fs');
const path = require('path');

/**
 * HTMLReportGenerator - Creates beautiful HTML reports from test results
 */
class HTMLReportGenerator {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Generate HTML report from results
   */
  generateHTML(results) {
    const timestamp = new Date().toISOString();
    const passRate = results.total > 0 ? Math.round((results.passed / results.total) * 100) : 0;
    const statusColor = results.failed === 0 ? '#10b981' : '#ef4444';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🐵 comet-monkey Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }

        h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 30px;
            padding: 0 20px;
        }

        .stat {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            backdrop-filter: blur(10px);
        }

        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
        }

        .stat-pass { color: #86efac; }
        .stat-fail { color: #fca5a5; }
        .stat-total { color: #ffffff; }

        main {
            padding: 40px;
        }

        section {
            margin-bottom: 40px;
        }

        h2 {
            color: #667eea;
            font-size: 1.8em;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }

        .test-group {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 15px;
        }

        .test-item {
            padding: 15px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .test-item:last-child {
            border-bottom: none;
        }

        .test-icon {
            font-size: 1.5em;
            min-width: 30px;
        }

        .test-pass { color: #10b981; }
        .test-fail { color: #ef4444; }

        .test-content {
            flex: 1;
        }

        .test-name {
            font-weight: 600;
            margin-bottom: 5px;
            color: #1f2937;
        }

        .test-details {
            font-size: 0.85em;
            color: #6b7280;
        }

        .error-section {
            background: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 4px;
        }

        .error-title {
            font-weight: 600;
            color: #991b1b;
            margin-bottom: 10px;
        }

        .error-item {
            background: white;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 0.85em;
            color: #7f1d1d;
            word-break: break-all;
        }

        .warning-section {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 4px;
        }

        .warning-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 10px;
        }

        .screenshots {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .screenshot {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.3s;
        }

        .screenshot:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .screenshot img {
            width: 100%;
            height: auto;
            display: block;
        }

        .screenshot-name {
            background: #f3f4f6;
            padding: 10px;
            font-size: 0.85em;
            color: #6b7280;
            word-break: break-all;
        }

        .progress-bar {
            width: 100%;
            height: 10px;
            background: #e5e7eb;
            border-radius: 5px;
            overflow: hidden;
            margin: 20px 0;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #059669);
            transition: width 0.3s;
        }

        .summary-text {
            text-align: center;
            color: #6b7280;
            margin-top: 20px;
            font-size: 0.95em;
        }

        footer {
            background: #f3f4f6;
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 0.85em;
            border-top: 1px solid #e5e7eb;
        }

        @media (max-width: 768px) {
            h1 { font-size: 1.8em; }
            .stats { grid-template-columns: 1fr; }
            main { padding: 20px; }
            .screenshots { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🐵 comet-monkey Test Report</h1>
            <div class="stats">
                <div class="stat">
                    <div class="stat-label">Total Tests</div>
                    <div class="stat-value stat-total">${results.total}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Passed</div>
                    <div class="stat-value stat-pass">${results.passed}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Failed</div>
                    <div class="stat-value stat-fail">${results.failed}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Pass Rate</div>
                    <div class="stat-value" style="color: ${statusColor}">${passRate}%</div>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${passRate}%"></div>
            </div>
            <div class="summary-text">
                Report generated on ${timestamp}
            </div>
        </header>

        <main>
            ${this.renderTestResults(results.results || [])}
            ${this.renderWarnings(results.warnings || [])}
            ${this.renderErrors(results.errors || [])}
            ${this.renderScreenshots(results.screenshots || [])}
        </main>

        <footer>
            Generated by <strong>comet-monkey</strong> v1.0.0 | 
            <a href="https://github.com/Yashraj786/comet-monkey" style="color: #667eea; text-decoration: none;">GitHub</a> | 
            ${timestamp}
        </footer>
    </div>
</body>
</html>`;
  }

  /**
   * Render test results section
   */
  renderTestResults(results) {
    if (results.length === 0) return '';

    const resultsHTML = results
      .map(result => {
        const icon = result.passed ? '✓' : '✗';
        const iconClass = result.passed ? 'test-pass' : 'test-fail';
        return `
            <div class="test-item">
                <div class="test-icon ${iconClass}">${icon}</div>
                <div class="test-content">
                    <div class="test-name">${result.name}</div>
                    ${result.details ? `<div class="test-details">${result.details}</div>` : ''}
                </div>
            </div>
        `;
      })
      .join('');

    return `
        <section>
            <h2>📋 Test Results</h2>
            <div class="test-group">
                ${resultsHTML}
            </div>
        </section>
    `;
  }

  /**
   * Render warnings section
   */
  renderWarnings(warnings) {
    if (warnings.length === 0) return '';

    const warningsHTML = warnings
      .slice(0, 10)
      .map(warning => {
        const message = warning.message || warning.error || 'Unknown warning';
        return `<div class="error-item">${message}</div>`;
      })
      .join('');

    return `
        <section>
            <div class="warning-section">
                <div class="warning-title">⚠️  Warnings (${warnings.length})</div>
                ${warningsHTML}
                ${warnings.length > 10 ? `<div style="color: #92400e; margin-top: 10px;">... and ${warnings.length - 10} more</div>` : ''}
            </div>
        </section>
    `;
  }

  /**
   * Render errors section
   */
  renderErrors(errors) {
    if (errors.length === 0) return '';

    const errorsHTML = errors
      .slice(0, 10)
      .map(error => {
        const message = error.message || error.error || 'Unknown error';
        return `<div class="error-item">${message}</div>`;
      })
      .join('');

    return `
        <section>
            <div class="error-section">
                <div class="error-title">❌ Errors (${errors.length})</div>
                ${errorsHTML}
                ${errors.length > 10 ? `<div style="color: #7f1d1d; margin-top: 10px;">... and ${errors.length - 10} more</div>` : ''}
            </div>
        </section>
    `;
  }

  /**
   * Render screenshots section
   */
  renderScreenshots(screenshots) {
    if (screenshots.length === 0) return '';

    const screenshotsHTML = screenshots
      .map(screenshot => {
        const filename = typeof screenshot === 'string' ? screenshot : screenshot.filename;
        return `
            <div class="screenshot">
                <img src="${filename}" alt="Screenshot: ${filename}" loading="lazy">
                <div class="screenshot-name">${filename}</div>
            </div>
        `;
      })
      .join('');

    return `
        <section>
            <h2>📸 Screenshots (${screenshots.length})</h2>
            <div class="screenshots">
                ${screenshotsHTML}
            </div>
        </section>
    `;
  }

  /**
   * Save HTML report to file
   */
  saveReport(results, outputPath = './playwright-screenshots/report.html') {
    try {
      const html = this.generateHTML(results);
      const dir = path.dirname(outputPath);

      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(outputPath, html, 'utf-8');
      console.log(`\n✓ HTML report saved to: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error(`✗ Error saving report: ${error.message}`);
      throw error;
    }
  }
}

module.exports = HTMLReportGenerator;
