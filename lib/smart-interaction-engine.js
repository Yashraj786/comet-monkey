/**
 * SmartInteractionEngine - Intelligent element discovery and interaction
 * Prioritizes interactions by type and impact for better bug discovery
 * 
 * Strategy:
 * 1. Forms First - Fill and test all forms
 * 2. Links Second - Discover new pages
 * 3. Buttons Third - Trigger actions
 * 4. Custom Elements - Handle special widgets
 */
class SmartInteractionEngine {
  constructor(config = {}) {
    this.config = {
      interaction_delay: config.interaction_delay || 300,
      max_interactions: config.max_interactions || 10,
      ...config
    };

    this.state = {
      visited_urls: new Set(),
      interacted_elements: new Set(),
      forms_filled: [],
      links_clicked: [],
      buttons_clicked: [],
      errors: []
    };
  }

  /**
   * Main entry point - discover and interact with elements
   */
  async runInteractions(page, maxInteractions = this.config.max_interactions) {
    try {
      console.log('\n🤖 Smart Interaction Engine Starting...\n');

      // Discover all interactive elements
      const elements = await this.discoverElements(page);
      console.log(`📍 Found: ${elements.forms.length} forms, ${elements.links.length} links, ${elements.buttons.length} buttons, ${elements.inputs.length} inputs\n`);

      let interactionCount = 0;

      // Phase 1: Interact with forms
      console.log('📝 Phase 1: Testing Forms...');
      for (const form of elements.forms.slice(0, maxInteractions / 2)) {
        if (interactionCount >= maxInteractions) break;
        try {
          await this.interactWithForm(page, form);
          interactionCount++;
        } catch (e) {
          this.state.errors.push({ type: 'form_interaction', error: e.message });
        }
        await this.sleep(this.config.interaction_delay);
      }

      // Phase 2: Click links to discover pages
      console.log('\n🔗 Phase 2: Discovering Links...');
      for (const link of elements.links.slice(0, maxInteractions / 3)) {
        if (interactionCount >= maxInteractions) break;
        try {
          const url = await link.getAttribute('href');
          if (url && !url.startsWith('#') && !this.state.visited_urls.has(url)) {
            await this.interactWithLink(page, link);
            this.state.visited_urls.add(url);
            interactionCount++;
          }
        } catch (e) {
          this.state.errors.push({ type: 'link_interaction', error: e.message });
        }
        await this.sleep(this.config.interaction_delay);
      }

      // Phase 3: Click buttons
      console.log('\n🔘 Phase 3: Clicking Buttons...');
      for (const button of elements.buttons.slice(0, maxInteractions / 4)) {
        if (interactionCount >= maxInteractions) break;
        try {
          await this.interactWithButton(page, button);
          interactionCount++;
        } catch (e) {
          this.state.errors.push({ type: 'button_interaction', error: e.message });
        }
        await this.sleep(this.config.interaction_delay);
      }

      console.log(`\n✅ Smart interactions complete: ${interactionCount} interactions performed\n`);

      return {
        interactions_performed: interactionCount,
        forms_tested: this.state.forms_filled.length,
        links_visited: this.state.links_clicked.length,
        buttons_clicked: this.state.buttons_clicked.length,
        errors: this.state.errors,
        state: this.state
      };
    } catch (error) {
      console.error(`❌ Smart Interaction Engine Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Discover all interactive elements on page
   */
  async discoverElements(page) {
    return await page.evaluate(() => {
      const elements = {
        forms: [],
        links: [],
        buttons: [],
        inputs: [],
        custom: []
      };

      // Find forms
      document.querySelectorAll('form').forEach((form, idx) => {
        elements.forms.push({
          type: 'form',
          id: form.id || `form-${idx}`,
          html: form.outerHTML.substring(0, 100),
          fields: form.querySelectorAll('input, textarea, select').length
        });
      });

      // Find links
      document.querySelectorAll('a').forEach((link, idx) => {
        if (link.offsetParent !== null) { // visible
          elements.links.push({
            type: 'link',
            id: link.id || `link-${idx}`,
            href: link.href,
            text: link.textContent.substring(0, 50),
            visible: true
          });
        }
      });

      // Find buttons
      document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]').forEach((btn, idx) => {
        if (btn.offsetParent !== null) { // visible
          elements.buttons.push({
            type: 'button',
            id: btn.id || `button-${idx}`,
            text: btn.textContent?.substring(0, 50) || btn.value,
            ariaLabel: btn.getAttribute('aria-label'),
            visible: true
          });
        }
      });

      // Find input fields
      document.querySelectorAll('input, textarea, select').forEach((input, idx) => {
        if (input.offsetParent !== null) { // visible
          elements.inputs.push({
            type: 'input',
            id: input.id || `input-${idx}`,
            inputType: input.type,
            placeholder: input.placeholder,
            name: input.name,
            visible: true
          });
        }
      });

      return elements;
    });
  }

  /**
   * Intelligently interact with a form
   */
  async interactWithForm(page, form) {
    try {
      // Find the form element in the page
      const formElement = await page.locator(`form#${form.id}, form:nth-of-type(1)`).first();

      if (!formElement) {
        console.log(`  ⚠️  Form not found: ${form.id}`);
        return;
      }

      // Get all inputs in the form
      const inputs = await formElement.locator('input, textarea, select').all();

      console.log(`  📝 Filling form with ${inputs.length} fields...`);

      for (const input of inputs) {
        try {
          const type = await input.getAttribute('type');
          const placeholder = await input.getAttribute('placeholder');
          const name = await input.getAttribute('name');
          const label = name || placeholder || 'unknown';

          // Generate appropriate value based on field type
          const value = this.generateSmartValue(type, placeholder, name);

          await input.fill(value);
          console.log(`    ✓ ${label}: "${value}"`);
        } catch (e) {
          // Field might be disabled or hidden
        }
      }

      // Try to submit the form
      const submitButton = await formElement.locator('button[type="submit"], input[type="submit"]').first();
      if (submitButton) {
        const isEnabled = await submitButton.isEnabled();
        if (isEnabled) {
          console.log(`  ✓ Submitting form...`);
          await submitButton.click();
          await this.sleep(1000); // Wait for submission
        }
      }

      this.state.forms_filled.push({ id: form.id, fields: inputs.length });
    } catch (error) {
      console.log(`  ✗ Error filling form: ${error.message}`);
      throw error;
    }
  }

  /**
   * Interact with a link
   */
  async interactWithLink(page, link) {
    try {
      // Find link by href
      const href = link.href || '';
      const text = link.text?.substring(0, 40) || 'unknown';

      if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
        return; // Skip fragments and javascript links
      }

      console.log(`  🔗 Clicking: ${text} (${href})`);

      const linkElement = await page.locator(`a[href="${href}"]`).first();
      if (linkElement) {
        await linkElement.click();
        await page.waitForLoadState('networkidle').catch(() => {}); // Wait for page load
      }

      this.state.links_clicked.push({ text, href });
    } catch (error) {
      console.log(`  ✗ Error clicking link: ${error.message}`);
      throw error;
    }
  }

  /**
   * Interact with a button
   */
  async interactWithButton(page, button) {
    try {
      const text = button.text?.substring(0, 40) || 'unknown';
      console.log(`  🔘 Clicking: ${text}`);

      const buttonElement = await page.locator(`button:has-text("${text}"), [role="button"]:has-text("${text}")`).first();
      if (buttonElement) {
        const isEnabled = await buttonElement.isEnabled();
        if (isEnabled) {
          await buttonElement.click();
          await this.sleep(500); // Wait for action
        }
      }

      this.state.buttons_clicked.push({ text });
    } catch (error) {
      console.log(`  ✗ Error clicking button: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate intelligent test values based on field hints
   */
  generateSmartValue(type = '', placeholder = '', name = '') {
    const combined = `${type} ${placeholder} ${name}`.toLowerCase();

    // Email
    if (combined.includes('email') || combined.includes('mail')) {
      return 'test@example.com';
    }

    // Password
    if (combined.includes('password') || combined.includes('pass')) {
      return 'SecurePass123!@#';
    }

    // Phone
    if (combined.includes('phone') || combined.includes('tel')) {
      return '+1 (555) 123-4567';
    }

    // Date
    if (combined.includes('date') || combined.includes('birthday')) {
      return '01/01/2024';
    }

    // URL
    if (combined.includes('url') || combined.includes('website')) {
      return 'https://example.com';
    }

    // Credit card (test values only)
    if (combined.includes('card') || combined.includes('credit')) {
      return '4111111111111111';
    }

    // Number
    if (type === 'number') {
      return '42';
    }

    // Checkbox
    if (type === 'checkbox') {
      return 'on';
    }

    // Default text
    return 'Test Value';
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get interaction state
   */
  getState() {
    return this.state;
  }

  /**
   * Reset state
   */
  resetState() {
    this.state = {
      visited_urls: new Set(),
      interacted_elements: new Set(),
      forms_filled: [],
      links_clicked: [],
      buttons_clicked: [],
      errors: []
    };
  }
}

module.exports = SmartInteractionEngine;
