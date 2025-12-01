/**
 * PerformanceTester - Core Web Vitals and performance metrics
 * 
 * Measures:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay) / INP (Interaction to Next Paint)
 * - CLS (Cumulative Layout Shift)
 * - TTFB (Time to First Byte)
 * - FCP (First Contentful Paint)
 * - DCL (DOM Content Loaded)
 * - Load time
 * - Memory usage
 */
class PerformanceTester {
  constructor(config = {}) {
    this.config = config;
    this.metrics = {
      core_web_vitals: {},
      navigation_timing: {},
      resource_timing: [],
      memory: {},
      performance_score: 0
    };
  }

  /**
   * Run comprehensive performance audit
   */
  async runAudit(page) {
    console.log('\n⚡ PERFORMANCE AUDIT (Core Web Vitals)');
    console.log('═'.repeat(60));

    try {
      // Get Core Web Vitals
      const webVitals = await this.getWebVitals(page);
      this.metrics.core_web_vitals = webVitals;

      // Get navigation timing
      const navTiming = await this.getNavigationTiming(page);
      this.metrics.navigation_timing = navTiming;

      // Get resource timing
      const resourceTiming = await this.getResourceTiming(page);
      this.metrics.resource_timing = resourceTiming;

      // Get memory info
      const memory = await this.getMemory(page);
      this.metrics.memory = memory;

      // Calculate performance score
      this.calculateScore();

      // Report results
      this.reportResults();

      return this.metrics;
    } catch (error) {
      console.log(`⚠️  Performance audit error: ${error.message}`);
      return this.metrics;
    }
  }

  /**
   * Get Core Web Vitals metrics
   */
  async getWebVitals(page) {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {
          lcp: null,  // Largest Contentful Paint
          fid: null,  // First Input Delay
          inp: null,  // Interaction to Next Paint
          cls: null   // Cumulative Layout Shift
        };

        // LCP - Largest Contentful Paint
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            vitals.lcp = entries[entries.length - 1].renderTime || entries[entries.length - 1].loadTime;
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Stop after a short time
          setTimeout(() => observer.disconnect(), 3000);
        } catch (e) {
          // LCP not available
        }

        // FID - First Input Delay
        try {
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              vitals.fid = entries[0].processingDuration;
            }
          });
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          // FID not available
        }

        // CLS - Cumulative Layout Shift
        try {
          let cls = 0;
          const clsObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              if (!entry.hadRecentInput) {
                cls += entry.value;
                vitals.cls = cls;
              }
            });
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
          
          setTimeout(() => clsObserver.disconnect(), 3000);
        } catch (e) {
          // CLS not available
        }

        // Return results after waiting for data
        setTimeout(() => {
          resolve(vitals);
        }, 3100);
      });
    });
  }

  /**
   * Get navigation timing metrics
   */
  async getNavigationTiming(page) {
    return await page.evaluate(() => {
      const nav = performance.timing;
      const navData = performance.getEntriesByType('navigation')[0];

      if (!navData) {
        return {
          ttfb: nav.responseStart - nav.requestStart,
          fcp: 0,
          domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
          loadComplete: nav.loadEventEnd - nav.loadEventStart,
          totalTime: nav.loadEventEnd - nav.navigationStart
        };
      }

      // FCP - First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      const fcp = fcpEntry ? fcpEntry.startTime : 0;

      return {
        ttfb: navData.responseStart - navData.requestStart,
        fcp: fcp,
        domContentLoaded: navData.domContentLoadedEventEnd - navData.domContentLoadedEventStart,
        loadComplete: navData.loadEventEnd - navData.loadEventStart,
        totalTime: navData.loadEventEnd - navData.navigationStart,
        dnsLookup: navData.domainLookupEnd - navData.domainLookupStart,
        tcpConnect: navData.connectEnd - navData.connectStart,
        requestTime: navData.responseStart - navData.requestStart,
        responseTime: navData.responseEnd - navData.responseStart,
        renderTime: navData.domInteractive - navData.domLoading
      };
    });
  }

  /**
   * Get resource timing (images, scripts, styles)
   */
  async getResourceTiming(page) {
    return await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      
      const summary = {
        total: resources.length,
        by_type: {},
        slowest: [],
        largest: []
      };

      // Group by type
      resources.forEach((resource) => {
        const type = resource.initiatorType || 'other';
        if (!summary.by_type[type]) {
          summary.by_type[type] = {
            count: 0,
            totalTime: 0,
            totalSize: 0
          };
        }
        
        summary.by_type[type].count++;
        summary.by_type[type].totalTime += resource.duration;
        summary.by_type[type].totalSize += resource.transferSize || 0;
      });

      // Find slowest resources
      const sorted = [...resources].sort((a, b) => b.duration - a.duration);
      summary.slowest = sorted.slice(0, 5).map(r => ({
        name: r.name.split('/').pop(),
        duration: Math.round(r.duration),
        type: r.initiatorType
      }));

      // Find largest resources
      const bySizes = [...resources].sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0));
      summary.largest = bySizes.slice(0, 5).map(r => ({
        name: r.name.split('/').pop(),
        size: Math.round((r.transferSize || 0) / 1024),
        type: r.initiatorType
      }));

      return summary;
    });
  }

  /**
   * Get memory usage (if available)
   */
  async getMemory(page) {
    return await page.evaluate(() => {
      if (!performance.memory) {
        return {
          available: false,
          message: 'Memory API not available'
        };
      }

      return {
        available: true,
        usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    });
  }

  /**
   * Calculate overall performance score (0-100)
   */
  calculateScore() {
    const { core_web_vitals, navigation_timing } = this.metrics;
    let score = 100;

    // LCP scoring (Largest Contentful Paint)
    // Good: < 2.5s, Needs Improvement: 2.5s-4s, Poor: > 4s
    if (core_web_vitals.lcp) {
      if (core_web_vitals.lcp > 4000) score -= 35;
      else if (core_web_vitals.lcp > 2500) score -= 15;
    }

    // FID scoring (First Input Delay)
    // Good: < 100ms, Needs Improvement: 100-300ms, Poor: > 300ms
    if (core_web_vitals.fid) {
      if (core_web_vitals.fid > 300) score -= 25;
      else if (core_web_vitals.fid > 100) score -= 10;
    }

    // CLS scoring (Cumulative Layout Shift)
    // Good: < 0.1, Needs Improvement: 0.1-0.25, Poor: > 0.25
    if (core_web_vitals.cls !== undefined && core_web_vitals.cls !== null) {
      if (core_web_vitals.cls > 0.25) score -= 25;
      else if (core_web_vitals.cls > 0.1) score -= 10;
    }

    // Total time scoring
    // Good: < 3s, Needs Improvement: 3-5s, Poor: > 5s
    if (navigation_timing.totalTime) {
      if (navigation_timing.totalTime > 5000) score -= 15;
      else if (navigation_timing.totalTime > 3000) score -= 5;
    }

    this.metrics.performance_score = Math.max(0, score);
  }

  /**
   * Get performance grade
   */
  getGrade() {
    const score = this.metrics.performance_score;
    
    if (score >= 90) return 'A (Excellent)';
    if (score >= 80) return 'B (Good)';
    if (score >= 70) return 'C (Fair)';
    if (score >= 50) return 'D (Poor)';
    return 'F (Very Poor)';
  }

  /**
   * Report results to console
   */
  reportResults() {
    const { core_web_vitals, navigation_timing, resource_timing, memory, performance_score } = this.metrics;

    console.log(`\n📊 Core Web Vitals:`);
    console.log(`  LCP (Largest Contentful Paint): ${core_web_vitals.lcp ? Math.round(core_web_vitals.lcp) + 'ms' : 'N/A'}`);
    console.log(`  FID (First Input Delay): ${core_web_vitals.fid ? Math.round(core_web_vitals.fid) + 'ms' : 'N/A'}`);
    console.log(`  CLS (Cumulative Layout Shift): ${core_web_vitals.cls !== undefined ? core_web_vitals.cls.toFixed(3) : 'N/A'}`);

    console.log(`\n⏱️  Navigation Timing:`);
    console.log(`  TTFB: ${Math.round(navigation_timing.ttfb)}ms`);
    console.log(`  FCP: ${Math.round(navigation_timing.fcp)}ms`);
    console.log(`  DOM Content Loaded: ${Math.round(navigation_timing.domContentLoaded)}ms`);
    console.log(`  Page Load Complete: ${Math.round(navigation_timing.loadComplete)}ms`);
    console.log(`  Total Time: ${Math.round(navigation_timing.totalTime)}ms`);

    if (navigation_timing.dnsLookup !== undefined) {
      console.log(`\n🌐 Network Details:`);
      console.log(`  DNS Lookup: ${Math.round(navigation_timing.dnsLookup)}ms`);
      console.log(`  TCP Connect: ${Math.round(navigation_timing.tcpConnect)}ms`);
      console.log(`  Request: ${Math.round(navigation_timing.requestTime)}ms`);
      console.log(`  Response: ${Math.round(navigation_timing.responseTime)}ms`);
      console.log(`  Render: ${Math.round(navigation_timing.renderTime)}ms`);
    }

    console.log(`\n📦 Resources:`);
    console.log(`  Total Requests: ${resource_timing.total}`);
    Object.entries(resource_timing.by_type).forEach(([type, data]) => {
      console.log(`  ${type}: ${data.count} requests, ${Math.round(data.totalTime)}ms, ${Math.round(data.totalSize / 1024)}KB`);
    });

    if (resource_timing.slowest.length > 0) {
      console.log(`\n🐌 Slowest Resources:`);
      resource_timing.slowest.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.name} (${r.type}): ${r.duration}ms`);
      });
    }

    if (resource_timing.largest.length > 0) {
      console.log(`\n📁 Largest Resources:`);
      resource_timing.largest.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.name} (${r.type}): ${r.size}KB`);
      });
    }

    if (memory.available) {
      console.log(`\n💾 Memory Usage:`);
      console.log(`  Used: ${memory.usedJSHeapSize}MB / ${memory.totalJSHeapSize}MB`);
      console.log(`  Limit: ${memory.jsHeapSizeLimit}MB`);
    }

    console.log(`\n📈 Performance Score: ${performance_score}/100 - ${this.getGrade()}`);

    // Recommendations
    this.getRecommendations();
  }

  /**
   * Get performance recommendations
   */
  getRecommendations() {
    const { core_web_vitals, navigation_timing, resource_timing } = this.metrics;
    const recommendations = [];

    // LCP recommendations
    if (core_web_vitals.lcp && core_web_vitals.lcp > 2500) {
      recommendations.push('⚠️  LCP is slow - optimize images, lazy load content');
    }

    // FID recommendations
    if (core_web_vitals.fid && core_web_vitals.fid > 100) {
      recommendations.push('⚠️  FID is high - reduce JavaScript execution time');
    }

    // CLS recommendations
    if (core_web_vitals.cls && core_web_vitals.cls > 0.1) {
      recommendations.push('⚠️  CLS is high - avoid layout shifts, set proper dimensions');
    }

    // Total time
    if (navigation_timing.totalTime > 5000) {
      recommendations.push('⚠️  Page load time is high - enable compression, minify code');
    }

    // Large resources
    if (resource_timing.largest[0] && resource_timing.largest[0].size > 500) {
      recommendations.push('⚠️  Large resources detected - compress images, split code');
    }

    if (recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`);
      recommendations.forEach(rec => console.log(`  ${rec}`));
    } else {
      console.log(`\n✅ Performance is good - no major optimizations needed`);
    }
  }

  /**
   * Get metrics as JSON
   */
  getMetrics() {
    return this.metrics;
  }

  /**
   * Get score
   */
  getScore() {
    return this.metrics.performance_score;
  }
}

module.exports = PerformanceTester;
