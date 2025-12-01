const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

/**
 * ConfigLoader - Loads and validates comet-monkey configuration
 * Supports: YAML, JSON, and JavaScript files
 * Features: Environment variable substitution, schema validation, defaults
 */
class ConfigLoader {
  /**
   * Default configuration
   */
  static getDefaults() {
    return {
      browser: {
        headless: true,
        browsers: ['chromium'],
        device_profiles: ['mobile']
      },
      testing: {
        base_url: process.env.BASE_URL || 'http://localhost:3000',
        timeout: 30000,
        max_interactions: 10,
        interaction_delay: 300,
        session_duration_ms: 60000
      },
      tests: {
        enabled: ['basic', 'network', 'interactive', 'extended'],
        custom_hooks: null
      },
      report: {
        format: ['json', 'html'],
        output_dir: './playwright-screenshots',
        compare_baseline: false,
        verbose: false
      }
    };
  }

  /**
   * Load configuration from file or object
   * @param {string|object|null} configSource - Path to config file or config object
   * @param {object} env - Environment variables (defaults to process.env)
   * @returns {object} Merged configuration
   */
  static load(configSource = null, env = process.env) {
    let config = this.getDefaults();

    // If no config source provided, try default locations
    if (!configSource) {
      const defaultPaths = [
        './comet-monkey.yml',
        './comet-monkey.yaml',
        './comet-monkey.json',
        './comet-monkey.js',
        'comet-monkey.config.js'
      ];

      for (const defaultPath of defaultPaths) {
        if (fs.existsSync(defaultPath)) {
          configSource = defaultPath;
          console.log(`ℹ️  Using config file: ${defaultPath}`);
          break;
        }
      }
    }

    // Load from file if path provided
    if (typeof configSource === 'string') {
      if (!fs.existsSync(configSource)) {
        console.warn(`⚠️  Config file not found: ${configSource}. Using defaults.`);
        return this.applyEnvironmentVariables(config, env);
      }

      const ext = path.extname(configSource).toLowerCase();
      const fileContent = fs.readFileSync(configSource, 'utf-8');

      try {
        let fileConfig = {};
        
        if (ext === '.json') {
          fileConfig = JSON.parse(fileContent);
        } else if (ext === '.yml' || ext === '.yaml') {
          fileConfig = YAML.parse(fileContent);
        } else if (ext === '.js') {
          // For JS files, use require
          delete require.cache[path.resolve(configSource)];
          fileConfig = require(path.resolve(configSource));
        } else {
          console.warn(`⚠️  Unknown config file format: ${ext}`);
          return this.applyEnvironmentVariables(config, env);
        }

        config = this.mergeConfigs(config, fileConfig);
        console.log(`✓ Loaded config from: ${configSource}`);
      } catch (error) {
        console.error(`✗ Error parsing config file: ${error.message}`);
        throw new Error(`Failed to load config: ${error.message}`);
      }
    } else if (typeof configSource === 'object') {
      // Merge provided config object
      config = this.mergeConfigs(config, configSource);
    }

    // Apply environment variables (they override file config)
    config = this.applyEnvironmentVariables(config, env);

    // Validate configuration
    this.validate(config);

    return config;
  }

  /**
   * Deep merge two configuration objects
   * @param {object} defaults - Default config
   * @param {object} override - Override config
   * @returns {object} Merged config
   */
  static mergeConfigs(defaults, override) {
    const result = { ...defaults };

    for (const key in override) {
      if (override.hasOwnProperty(key)) {
        if (typeof override[key] === 'object' && override[key] !== null && !Array.isArray(override[key])) {
          result[key] = this.mergeConfigs(result[key] || {}, override[key]);
        } else {
          result[key] = override[key];
        }
      }
    }

    return result;
  }

  /**
   * Apply environment variable overrides
   * Supports: BASE_URL, TIMEOUT, MAX_INTERACTIONS, BROWSERS, etc.
   */
  static applyEnvironmentVariables(config, env) {
    const envMap = {
      'BASE_URL': 'testing.base_url',
      'TIMEOUT': 'testing.timeout',
      'MAX_INTERACTIONS': 'testing.max_interactions',
      'INTERACTION_DELAY': 'testing.interaction_delay',
      'BROWSERS': 'browser.browsers',
      'DEVICES': 'browser.device_profiles',
      'HEADLESS': 'browser.headless',
      'OUTPUT_DIR': 'report.output_dir',
      'REPORT_FORMAT': 'report.format',
      'VERBOSE': 'report.verbose'
    };

    for (const [envKey, configPath] of Object.entries(envMap)) {
      if (env[envKey] !== undefined) {
        this.setNestedValue(config, configPath, env[envKey]);
      }
    }

    return config;
  }

  /**
   * Set value in nested object using dot notation
   */
  static setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }

    // Convert value types
    if (value === 'true') value = true;
    if (value === 'false') value = false;
    if (value === 'null') value = null;
    if (!isNaN(value) && value !== '') value = Number(value);

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Validate configuration against schema
   */
  static validate(config) {
    const errors = [];

    // Validate browser config
    if (!Array.isArray(config.browser.browsers)) {
      errors.push('browser.browsers must be an array');
    }
    if (!Array.isArray(config.browser.device_profiles)) {
      errors.push('browser.device_profiles must be an array');
    }

    // Validate browser types
    const validBrowsers = ['chromium', 'firefox', 'webkit'];
    for (const browser of config.browser.browsers) {
      if (!validBrowsers.includes(browser)) {
        errors.push(`Invalid browser: ${browser}. Must be one of: ${validBrowsers.join(', ')}`);
      }
    }

    // Validate testing config
    if (typeof config.testing.timeout !== 'number' || config.testing.timeout < 1000) {
      errors.push('testing.timeout must be a number >= 1000');
    }
    if (typeof config.testing.max_interactions !== 'number' || config.testing.max_interactions < 1) {
      errors.push('testing.max_interactions must be a number >= 1');
    }
    if (!config.testing.base_url) {
      errors.push('testing.base_url is required');
    }

    // Validate tests config
    if (!Array.isArray(config.tests.enabled)) {
      errors.push('tests.enabled must be an array');
    }

    // Validate report config
    if (!Array.isArray(config.report.format)) {
      errors.push('report.format must be an array');
    }
    const validFormats = ['json', 'html', 'dashboard'];
    for (const format of config.report.format) {
      if (!validFormats.includes(format)) {
        errors.push(`Invalid report format: ${format}. Must be one of: ${validFormats.join(', ')}`);
      }
    }

    if (errors.length > 0) {
      console.error('❌ Configuration validation failed:');
      errors.forEach(err => console.error(`  - ${err}`));
      throw new Error('Invalid configuration');
    }

    return true;
  }

  /**
   * Generate example YAML config file
   */
  static generateExample() {
    return `# comet-monkey Configuration File
# This file configures the autonomous testing framework

# Browser Configuration
browser:
  headless: true              # Run browsers in headless mode
  browsers:                   # Browsers to test on
    - chromium               # - chromium
    - firefox                # - firefox  
    - webkit                 # - webkit (Safari)
  device_profiles:           # Device types to test
    - mobile                 # - mobile
    - tablet                 # - tablet
    - desktop                # - desktop

# Testing Configuration
testing:
  base_url: \${BASE_URL}      # Base URL to test (can use env vars)
  timeout: 30000              # Page load timeout (ms)
  max_interactions: 10        # Max random interactions per page
  interaction_delay: 300      # Delay between interactions (ms)
  session_duration_ms: 60000  # Extended session duration (ms)

# Test Selection
tests:
  enabled:                    # Which test suites to run
    - basic                   # Basic health checks
    - network                 # Network analysis
    - interactive             # Interactive testing
    - extended                # Extended session (60s)
  custom_hooks: null          # Path to custom test hooks

# Report Configuration
report:
  format:                     # Report output formats
    - json                    # JSON report
    - html                    # HTML report
  output_dir: ./playwright-screenshots  # Report output directory
  compare_baseline: false     # Compare against baseline
  verbose: false              # Verbose logging

# Environment Variable Override Examples:
# BASE_URL=https://example.com npx comet-monkey
# BROWSERS=chromium,firefox npx comet-monkey
# MAX_INTERACTIONS=20 npx comet-monkey
# OUTPUT_DIR=./my-reports npx comet-monkey
`;
  }

  /**
   * Save example config to file
   */
  static saveExample(filePath = 'comet-monkey.yml.example') {
    const example = this.generateExample();
    fs.writeFileSync(filePath, example);
    console.log(`✓ Saved example config to: ${filePath}`);
  }
}

module.exports = ConfigLoader;
