/**
 * SecurityTester - OWASP and security headers validation
 * 
 * Tests for:
 * - Security headers (CSP, HSTS, X-Frame-Options, etc.)
 * - HTTPS/SSL configuration
 * - CSRF token protection
 * - XSS vulnerabilities
 * - Cookie security
 * - Form security
 */
class SecurityTester {
  constructor(config = {}) {
    this.config = config;
    this.results = {
      headers: {},
      vulnerabilities: [],
      warnings: [],
      passed: []
    };
  }

  /**
   * Run full security audit
   */
  async runAudit(page) {
    console.log('\n🔒 SECURITY AUDIT (OWASP Top 10)');
    console.log('═'.repeat(60));

    try {
      // Check security headers
      await this.checkSecurityHeaders(page);

      // Check HTTPS/SSL
      await this.checkHTTPS(page);

      // Check CSRF protection
      await this.checkCSRFProtection(page);

      // Check for XSS vulnerabilities
      await this.checkXSSVulnerabilities(page);

      // Check cookie security
      await this.checkCookieSecurity(page);

      // Check form security
      await this.checkFormSecurity(page);

      // Report results
      this.reportResults();

      return this.results;
    } catch (error) {
      console.log(`⚠️  Security audit error: ${error.message}`);
      return this.results;
    }
  }

  /**
   * Check security headers
   */
  async checkSecurityHeaders(page) {
    // Navigate to get response headers
    const response = await page.reload({ waitUntil: 'networkidle' }).catch(() => null);
    
    if (!response) {
      this.results.warnings.push({
        id: 'headers-check-failed',
        message: 'Could not retrieve response headers'
      });
      return;
    }

    const headers = response.headers();
    
    // Required security headers
    const requiredHeaders = {
      'strict-transport-security': {
        name: 'HSTS',
        description: 'Enforce HTTPS',
        severity: 'high'
      },
      'content-security-policy': {
        name: 'CSP',
        description: 'Prevent inline scripts and XSS',
        severity: 'high'
      },
      'x-content-type-options': {
        name: 'X-Content-Type-Options',
        description: 'Prevent MIME sniffing',
        severity: 'medium'
      },
      'x-frame-options': {
        name: 'X-Frame-Options',
        description: 'Prevent clickjacking',
        severity: 'high'
      },
      'x-xss-protection': {
        name: 'X-XSS-Protection',
        description: 'Legacy XSS protection',
        severity: 'low'
      },
      'referrer-policy': {
        name: 'Referrer-Policy',
        description: 'Control referrer information',
        severity: 'medium'
      }
    };

    this.results.headers = {};

    Object.entries(requiredHeaders).forEach(([headerName, headerInfo]) => {
      const value = headers[headerName.toLowerCase()];
      
      this.results.headers[headerInfo.name] = {
        present: !!value,
        value: value || 'NOT SET',
        severity: headerInfo.severity,
        description: headerInfo.description
      };

      if (!value) {
        this.results.vulnerabilities.push({
          id: headerName,
          name: headerInfo.name,
          severity: headerInfo.severity,
          message: `Missing security header: ${headerInfo.name}`,
          description: headerInfo.description,
          recommendation: `Add ${headerInfo.name} header to server configuration`
        });
      } else {
        this.results.passed.push({
          id: headerName,
          name: headerInfo.name,
          message: `${headerInfo.name} header is set`
        });
      }
    });

    // Additional header checks
    const permissionsPolicyHeader = headers['permissions-policy'] || headers['feature-policy'];
    if (!permissionsPolicyHeader) {
      this.results.warnings.push({
        id: 'permissions-policy',
        message: 'Permissions-Policy header not set (recommended)',
        severity: 'low'
      });
    }
  }

  /**
   * Check HTTPS/SSL configuration
   */
  async checkHTTPS(page) {
    const url = page.url();
    
    if (url.startsWith('https://')) {
      this.results.passed.push({
        id: 'https',
        name: 'HTTPS',
        message: 'Site uses HTTPS'
      });
    } else if (url.startsWith('http://')) {
      this.results.vulnerabilities.push({
        id: 'https',
        name: 'HTTPS',
        severity: 'critical',
        message: 'Site uses unencrypted HTTP',
        description: 'All traffic is sent in plain text',
        recommendation: 'Enable HTTPS/SSL on the server'
      });
    }
  }

  /**
   * Check CSRF protection
   */
  async checkCSRFProtection(page) {
    const formSecurityData = await page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      const results = [];
      
      forms.forEach((form) => {
        const hasTokenInput = form.querySelector('input[name*="csrf"], input[name*="token"], input[name*="authenticity"]');
        const csrfToken = form.querySelector('[name*="csrf_token"], [name*="_token"], [name*="authenticity_token"]');
        
        results.push({
          hasProtection: !!(hasTokenInput || csrfToken),
          action: form.action,
          method: form.method,
          fields: form.querySelectorAll('input').length
        });
      });
      
      return results;
    });

    const unprotectedForms = formSecurityData.filter(f => !f.hasProtection && f.method.toUpperCase() === 'POST');
    
    if (unprotectedForms.length > 0) {
      this.results.vulnerabilities.push({
        id: 'csrf-protection',
        name: 'CSRF Protection',
        severity: 'high',
        message: `${unprotectedForms.length} POST form(s) without CSRF token`,
        description: 'Forms may be vulnerable to Cross-Site Request Forgery',
        recommendation: 'Add CSRF tokens to all POST forms'
      });
    } else if (formSecurityData.length > 0) {
      this.results.passed.push({
        id: 'csrf-protection',
        name: 'CSRF Protection',
        message: `${formSecurityData.filter(f => f.hasProtection).length}/${formSecurityData.length} forms are CSRF-protected`
      });
    } else {
      this.results.warnings.push({
        id: 'csrf-protection',
        name: 'CSRF Protection',
        message: 'No forms found to test for CSRF protection'
      });
    }
  }

  /**
   * Check for XSS vulnerabilities
   */
  async checkXSSVulnerabilities(page) {
    // Check for inline scripts
    const inlineScripts = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script:not([src]'));
      return {
        count: scripts.length,
        hasInlineScripts: scripts.length > 0
      };
    });

    if (inlineScripts.hasInlineScripts) {
      this.results.warnings.push({
        id: 'inline-scripts',
        name: 'Inline Scripts',
        severity: 'medium',
        message: `${inlineScripts.count} inline script(s) found`,
        description: 'Inline scripts may bypass CSP and increase XSS risk',
        recommendation: 'Move inline scripts to external files or use CSP nonces'
      });
    }

    // Check for eval usage
    const hasEval = await page.evaluate(() => {
      try {
        // Check if eval is called in scripts
        const pageSource = document.documentElement.innerHTML;
        return pageSource.includes('eval(');
      } catch (e) {
        return false;
      }
    });

    if (hasEval) {
      this.results.vulnerabilities.push({
        id: 'eval-usage',
        name: 'eval() Usage',
        severity: 'high',
        message: 'eval() function detected',
        description: 'eval() is a serious security risk and source of XSS',
        recommendation: 'Remove all eval() calls, use safer alternatives'
      });
    }

    // Check for unsafe DOM manipulation
    const unsafeMethods = await page.evaluate(() => {
      const pageSource = document.documentElement.innerHTML;
      const unsafe = [];
      
      if (pageSource.includes('.innerHTML =')) unsafe.push('innerHTML assignment');
      if (pageSource.includes('.outerHTML =')) unsafe.push('outerHTML assignment');
      if (pageSource.includes('.insertAdjacentHTML(')) unsafe.push('insertAdjacentHTML');
      if (pageSource.includes('document.write(')) unsafe.push('document.write');
      
      return unsafe;
    });

    if (unsafeMethods.length > 0) {
      this.results.warnings.push({
        id: 'unsafe-dom',
        name: 'Unsafe DOM Methods',
        severity: 'medium',
        message: `Unsafe DOM methods detected: ${unsafeMethods.join(', ')}`,
        description: 'These methods can introduce XSS vulnerabilities if used with user input',
        recommendation: 'Use textContent instead of innerHTML, or sanitize input'
      });
    } else {
      this.results.passed.push({
        id: 'xss-prevention',
        name: 'XSS Prevention',
        message: 'No obvious XSS vulnerabilities detected'
      });
    }
  }

  /**
   * Check cookie security
   */
  async checkCookieSecurity(page) {
    const cookies = await page.context().cookies();
    
    if (cookies.length === 0) {
      this.results.warnings.push({
        id: 'cookies',
        message: 'No cookies found'
      });
      return;
    }

    const insecureCookies = cookies.filter(c => {
      return !c.secure || !c.httpOnly;
    });

    if (insecureCookies.length > 0) {
      insecureCookies.forEach(cookie => {
        const issues = [];
        if (!cookie.secure) issues.push('not HTTPS-only');
        if (!cookie.httpOnly) issues.push('accessible from JavaScript');
        
        this.results.vulnerabilities.push({
          id: `cookie-${cookie.name}`,
          name: `Insecure Cookie: ${cookie.name}`,
          severity: 'high',
          message: `Cookie "${cookie.name}" is ${issues.join(' and ')}`,
          description: 'Insecure cookies can be intercepted or accessed by malicious scripts',
          recommendation: 'Set Secure and HttpOnly flags on all sensitive cookies'
        });
      });
    } else {
      this.results.passed.push({
        id: 'cookies',
        name: 'Cookie Security',
        message: `All ${cookies.length} cookie(s) have Secure and HttpOnly flags`
      });
    }
  }

  /**
   * Check form security
   */
  async checkFormSecurity(page) {
    const formData = await page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      const results = [];

      forms.forEach((form) => {
        const passwordInputs = form.querySelectorAll('input[type="password"]');
        const hasHTTPS = window.location.protocol === 'https:';
        
        results.push({
          action: form.action,
          hasPasswordField: passwordInputs.length > 0,
          isFormSecure: hasHTTPS || form.action?.startsWith('https://')
        });
      });

      return results;
    });

    formData.forEach((form) => {
      if (form.hasPasswordField && !form.isFormSecure) {
        this.results.vulnerabilities.push({
          id: 'password-form-not-https',
          name: 'Password Form Not HTTPS',
          severity: 'critical',
          message: `Password form submits to non-HTTPS URL`,
          description: 'Passwords transmitted over HTTP can be intercepted',
          recommendation: 'Ensure password forms submit over HTTPS'
        });
      }
    });

    if (formData.every(f => !f.hasPasswordField || f.isFormSecure)) {
      this.results.passed.push({
        id: 'form-security',
        name: 'Form Security',
        message: 'All forms transmit securely'
      });
    }
  }

  /**
   * Report results
   */
  reportResults() {
    console.log(`\n🔐 Security Headers:`);
    Object.entries(this.results.headers).forEach(([name, info]) => {
      const icon = info.present ? '✓' : '✗';
      const severity = info.severity === 'high' ? '⚠️ ' : '  ';
      console.log(`  ${severity}${icon} ${name}: ${info.present ? 'SET' : 'MISSING'}`);
    });

    console.log(`\n📊 Security Summary:`);
    console.log(`  ✓ Passed: ${this.results.passed.length}`);
    console.log(`  ⚠️  Warnings: ${this.results.warnings.length}`);
    console.log(`  ❌ Vulnerabilities: ${this.results.vulnerabilities.length}`);

    if (this.results.vulnerabilities.length > 0) {
      console.log(`\n❌ SECURITY VULNERABILITIES:`);
      this.results.vulnerabilities.forEach((v) => {
        console.log(`  - [${v.severity.toUpperCase()}] ${v.name}: ${v.message}`);
      });
    }

    if (this.results.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS:`);
      this.results.warnings.slice(0, 5).forEach((w) => {
        console.log(`  - ${w.message}`);
      });
    }

    // Security score
    const totalIssues = this.results.vulnerabilities.length + (this.results.warnings.length * 0.5);
    const score = Math.max(0, 100 - (totalIssues * 10));
    
    console.log(`\n📈 Security Score: ${Math.round(score)}/100`);
    
    if (score >= 80) {
      console.log('✅ GOOD: Security is well-configured');
    } else if (score >= 60) {
      console.log('⚠️  FAIR: There are some security issues to fix');
    } else {
      console.log('❌ POOR: Major security improvements needed');
    }
  }

  /**
   * Get results
   */
  getResults() {
    return this.results;
  }
}

module.exports = SecurityTester;
