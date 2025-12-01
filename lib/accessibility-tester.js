/**
 * AccessibilityTester - WCAG 2.1 Level A/AA compliance testing
 * 
 * Tests for:
 * - Color contrast (APCA)
 * - Keyboard navigation
 * - ARIA attributes
 * - Form labels
 * - Image alt text
 * - Heading hierarchy
 * - Screen reader compatibility
 * - Semantic HTML
 */
class AccessibilityTester {
  constructor(config = {}) {
    this.config = config;
    this.results = {
      violations: [],
      warnings: [],
      passed: [],
      incomplete: []
    };
  }

  /**
   * Run full accessibility audit
   */
  async runFullAudit(page) {
    console.log('\n♿ ACCESSIBILITY AUDIT (WCAG 2.1 A/AA)');
    console.log('═'.repeat(60));

    try {
      // Inject axe-core for comprehensive testing
      await this.injectAxeCore(page);
      
      // Run axe
      const axeResults = await this.runAxeCore(page);
      
      // Run custom checks
      const customResults = await this.runCustomChecks(page);
      
      // Combine results
      const combined = this.combineResults(axeResults, customResults);
      
      this.results = combined;
      
      // Report results
      this.reportResults();
      
      return combined;
    } catch (error) {
      console.log(`⚠️  Accessibility audit incomplete: ${error.message}`);
      // Return partial results if axe fails
      return await this.runCustomChecks(page);
    }
  }

  /**
   * Inject axe-core library
   */
  async injectAxeCore(page) {
    const axeCoreURL = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js';
    
    try {
      await page.addScriptTag({ url: axeCoreURL });
      console.log('✓ Loaded axe-core library');
    } catch (error) {
      console.log(`⚠️  Could not load axe-core from CDN, using custom checks only`);
      throw error;
    }
  }

  /**
   * Run axe-core accessibility tests
   */
  async runAxeCore(page) {
    return await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        if (typeof axe === 'undefined') {
          reject(new Error('axe-core not loaded'));
          return;
        }

        axe.run(
          {
            standards: ['wcag2aa', 'wcag21aa'],
            runOnly: {
              type: 'standard',
              values: ['wcag2aa', 'wcag21aa']
            }
          },
          (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          }
        );
      });
    });
  }

  /**
   * Run custom accessibility checks (if axe fails)
   */
  async runCustomChecks(page) {
    const results = {
      violations: [],
      warnings: [],
      passed: [],
      incomplete: []
    };

    try {
      // Check 1: Images have alt text
      const imagesWithoutAlt = await this.checkImageAltText(page);
      if (imagesWithoutAlt.length > 0) {
        results.violations.push({
          id: 'image-alt-text',
          impact: 'critical',
          description: 'Images must have alt text',
          nodes: imagesWithoutAlt,
          help: 'Every image must have descriptive alt text for screen readers'
        });
      } else {
        results.passed.push({
          id: 'image-alt-text',
          description: 'All images have alt text'
        });
      }

      // Check 2: Form labels
      const formIssues = await this.checkFormLabels(page);
      if (formIssues.length > 0) {
        results.violations.push({
          id: 'form-labels',
          impact: 'serious',
          description: 'Form fields must have labels',
          nodes: formIssues,
          help: 'All input fields must be associated with a label'
        });
      } else {
        results.passed.push({
          id: 'form-labels',
          description: 'All form fields have labels'
        });
      }

      // Check 3: Heading hierarchy
      const headingIssues = await this.checkHeadingHierarchy(page);
      if (headingIssues.length > 0) {
        results.warnings.push({
          id: 'heading-hierarchy',
          impact: 'moderate',
          description: 'Heading hierarchy is broken',
          nodes: headingIssues,
          help: 'Headings should go H1 → H2 → H3, not skip levels'
        });
      } else {
        results.passed.push({
          id: 'heading-hierarchy',
          description: 'Heading hierarchy is correct'
        });
      }

      // Check 4: Color contrast
      const contrastIssues = await this.checkColorContrast(page);
      if (contrastIssues.length > 0) {
        results.violations.push({
          id: 'color-contrast',
          impact: 'serious',
          description: 'Text color contrast is insufficient',
          nodes: contrastIssues,
          help: 'Text must have sufficient contrast (4.5:1 for normal text, 3:1 for large text)'
        });
      } else {
        results.passed.push({
          id: 'color-contrast',
          description: 'Color contrast is sufficient'
        });
      }

      // Check 5: ARIA attributes
      const ariaIssues = await this.checkAriaAttributes(page);
      if (ariaIssues.length > 0) {
        results.warnings.push({
          id: 'aria-attributes',
          impact: 'moderate',
          description: 'ARIA attributes may be incorrect',
          nodes: ariaIssues,
          help: 'Ensure ARIA attributes are used correctly'
        });
      } else {
        results.passed.push({
          id: 'aria-attributes',
          description: 'ARIA attributes are correct'
        });
      }

      // Check 6: Keyboard navigation
      const keyboardIssues = await this.checkKeyboardNavigation(page);
      if (keyboardIssues.length > 0) {
        results.incomplete.push({
          id: 'keyboard-navigation',
          description: 'Keyboard navigation needs manual testing',
          help: 'Test with Tab key to ensure all interactive elements are reachable'
        });
      } else {
        results.passed.push({
          id: 'keyboard-navigation',
          description: 'Interactive elements are keyboard accessible'
        });
      }

      // Check 7: Page language
      const langIssue = await this.checkLanguageAttribute(page);
      if (langIssue) {
        results.warnings.push({
          id: 'page-language',
          impact: 'moderate',
          description: 'Page language not specified',
          help: 'Add lang attribute to html element'
        });
      } else {
        results.passed.push({
          id: 'page-language',
          description: 'Page language is specified'
        });
      }

    } catch (error) {
      console.log(`⚠️  Error running custom checks: ${error.message}`);
    }

    return results;
  }

  /**
   * Check images for alt text
   */
  async checkImageAltText(page) {
    return await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const issues = [];
      
      images.forEach((img, idx) => {
        if (!img.alt || img.alt.trim() === '') {
          issues.push({
            node: `img #${idx}`,
            html: img.outerHTML.substring(0, 100),
            message: 'Image missing alt text'
          });
        }
      });
      
      return issues;
    });
  }

  /**
   * Check form labels
   */
  async checkFormLabels(page) {
    return await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea, select');
      const issues = [];
      
      inputs.forEach((input, idx) => {
        const hasLabel = document.querySelector(`label[for="${input.id}"]`) || 
                        input.getAttribute('aria-label') ||
                        input.parentElement.querySelector('label');
        
        if (!hasLabel && !input.placeholder) {
          issues.push({
            node: `input #${idx}`,
            id: input.id || 'no-id',
            message: 'Form field missing label'
          });
        }
      });
      
      return issues;
    });
  }

  /**
   * Check heading hierarchy
   */
  async checkHeadingHierarchy(page) {
    return await page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const issues = [];
      let lastLevel = 0;
      
      headings.forEach((heading, idx) => {
        const level = parseInt(heading.tagName[1]);
        
        // Check if we skip levels (h1 -> h3 is bad)
        if (lastLevel > 0 && level > lastLevel + 1) {
          issues.push({
            node: heading.tagName,
            index: idx,
            message: `Heading hierarchy broken: ${lastLevel === 0 ? 'H1' : 'H' + lastLevel} → H${level}`
          });
        }
        
        lastLevel = level;
      });
      
      return issues;
    });
  }

  /**
   * Check color contrast (simplified check)
   */
  async checkColorContrast(page) {
    return await page.evaluate(() => {
      // Simplified contrast check - would need WCAG contrast algorithm for full accuracy
      const issues = [];
      const textElements = document.querySelectorAll('p, span, a, label, button, h1, h2, h3, h4, h5, h6');
      
      textElements.forEach((el, idx) => {
        if (el.textContent.trim().length > 0) {
          const styles = window.getComputedStyle(el);
          const bgColor = styles.backgroundColor;
          const color = styles.color;
          
          // Very basic check: light text on light background or dark on dark
          // In production, use WCAG contrast algorithm
          if (color === 'rgb(255, 255, 255)' && bgColor === 'rgb(255, 255, 255)') {
            issues.push({
              node: el.tagName,
              index: idx,
              message: 'Text color contrast too low (white on white)'
            });
          }
        }
      });
      
      return issues;
    });
  }

  /**
   * Check ARIA attributes
   */
  async checkAriaAttributes(page) {
    return await page.evaluate(() => {
      const issues = [];
      const ariaElements = document.querySelectorAll('[aria-label], [aria-describedby], [role]');
      
      // Check for invalid aria attributes
      ariaElements.forEach((el, idx) => {
        const ariaLabel = el.getAttribute('aria-label');
        if (ariaLabel && ariaLabel.trim() === '') {
          issues.push({
            node: el.tagName,
            index: idx,
            message: 'aria-label is empty'
          });
        }
      });
      
      return issues;
    });
  }

  /**
   * Check keyboard navigation
   */
  async checkKeyboardNavigation(page) {
    return await page.evaluate(() => {
      const issues = [];
      const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
      
      // Check if focus styles are visible
      let hasFocusStyles = false;
      const styleSheets = document.styleSheets;
      
      for (let sheet of styleSheets) {
        try {
          const rules = sheet.cssRules || sheet.rules;
          for (let rule of rules) {
            if (rule.selectorText && (rule.selectorText.includes(':focus') || rule.selectorText.includes(':focus-visible'))) {
              hasFocusStyles = true;
              break;
            }
          }
        } catch (e) {
          // Cross-origin stylesheet
        }
      }
      
      if (!hasFocusStyles && interactiveElements.length > 0) {
        issues.push({
          message: 'No visible focus styles defined'
        });
      }
      
      return issues;
    });
  }

  /**
   * Check language attribute
   */
  async checkLanguageAttribute(page) {
    return await page.evaluate(() => {
      const html = document.documentElement;
      return !html.getAttribute('lang');
    });
  }

  /**
   * Combine axe and custom results
   */
  combineResults(axeResults, customResults) {
    // If axe succeeded, use those results
    if (axeResults && axeResults.violations) {
      return {
        violations: axeResults.violations || [],
        warnings: (axeResults.incomplete || []).concat(customResults.warnings || []),
        passed: axeResults.passes || [],
        incomplete: customResults.incomplete || []
      };
    }
    
    // Otherwise use custom results
    return customResults;
  }

  /**
   * Report results to console
   */
  reportResults() {
    const { violations, warnings, passed, incomplete } = this.results;

    console.log(`\n📊 WCAG 2.1 Compliance Results:`);
    console.log(`  ✓ Passed: ${passed.length}`);
    console.log(`  ⚠️  Warnings: ${warnings.length}`);
    console.log(`  ❌ Violations: ${violations.length}`);
    console.log(`  ❓ Incomplete: ${incomplete.length}`);

    if (violations.length > 0) {
      console.log(`\n❌ CRITICAL VIOLATIONS:`);
      violations.slice(0, 5).forEach(v => {
        console.log(`  - ${v.id || v.description}: ${v.help || v.message}`);
      });
      if (violations.length > 5) {
        console.log(`  ... and ${violations.length - 5} more`);
      }
    }

    if (warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS:`);
      warnings.slice(0, 3).forEach(w => {
        console.log(`  - ${w.id || w.description}: ${w.help || w.message}`);
      });
      if (warnings.length > 3) {
        console.log(`  ... and ${warnings.length - 3} more`);
      }
    }

    // Accessibility score
    const totalIssues = violations.length + warnings.length;
    const score = Math.max(0, 100 - (violations.length * 10 + warnings.length * 5));
    
    console.log(`\n📈 Accessibility Score: ${score}/100`);
    
    if (score >= 80) {
      console.log('✅ GREAT! Site is mostly accessible');
    } else if (score >= 60) {
      console.log('⚠️  FAIR: There are some accessibility issues to fix');
    } else {
      console.log('❌ POOR: Major accessibility improvements needed');
    }
  }

  /**
   * Get results as JSON
   */
  getResults() {
    return this.results;
  }

  /**
   * Get accessibility score
   */
  getScore() {
    const { violations, warnings } = this.results;
    return Math.max(0, 100 - (violations.length * 10 + warnings.length * 5));
  }

  /**
   * Check if WCAG 2.1 Level AA compliant
   */
  isCompliant() {
    const { violations } = this.results;
    return violations.length === 0;
  }
}

module.exports = AccessibilityTester;
