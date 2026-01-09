/**
 * Disable Developer Tools Utility
 * 
 * This module disables developer tools in production to prevent
 * unauthorized access and maintain exam security.
 * 
 * Features:
 * - Only active in production mode
 * - Detects and blocks common developer tool access methods
 * - Redirects or shows warning when dev tools are detected
 */

import { DEVELOPMENT_CONFIG } from '@/config/development';

export class DevToolsDisabler {
  private isEnabled: boolean;
  private detectInterval: NodeJS.Timeout | null = null;
  private disableDevtool: any = null;

  constructor() {
    this.isEnabled = DEVELOPMENT_CONFIG.IS_PRODUCTION;
    this.loadDisableDevtool();
  }

  /**
   * Dynamically load disable-devtool only in production
   */
  private async loadDisableDevtool() {
    if (!this.isEnabled) {
      console.log('🔧 DevTools protection disabled in development mode');
      return;
    }

    try {
      // Dynamic import to avoid loading in development
      const { default: disableDevtool } = await import('disable-devtool');
      this.disableDevtool = disableDevtool;
      console.log('🔒 DevTools protection loaded for production');
    } catch (error) {
      console.warn('Failed to load disable-devtool:', error);
    }
  }

  /**
   * Initialize developer tools protection
   */
  public init(): void {
    if (!this.isEnabled) {
      console.log('🔧 DevTools protection skipped (development mode)');
      return;
    }

    if (!this.disableDevtool) {
      console.warn('disable-devtool not loaded, using fallback protection');
      this.initFallbackProtection();
      return;
    }

    try {
      this.disableDevtool({
        // Clear console
        clearConsole: true,
        
        // Disable select and copy
        disableMenu: true,
        disableSelect: true,
        disableCopy: true,
        disableCut: true,
        disablePaste: true,

        // Developer tools detection
        detectors: {
          unknown: true,
          console: true,
          debugger: true,
          size: true,
          date: true,
          function: true,
          regexp: true,
          proxy: true,
        },

        // Callback when dev tools detected
        ondevtoolopen: (type: string) => {
          console.log('Developer tools detected:', type);
          this.handleDevToolsDetected();
        },

        // Disable keyboard shortcuts
        disableIframeParents: true,
        disableSelectByCSS: true,
      });

      console.log('🔒 DevTools protection initialized');
    } catch (error) {
      console.error('Failed to initialize disable-devtool:', error);
      this.initFallbackProtection();
    }
  }

  /**
   * Fallback protection if disable-devtool fails
   */
  private initFallbackProtection(): void {
    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Disable common keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Disable F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+C (Element Inspector)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
    });

    // Detect dev tools by console.log monitoring
    this.detectInterval = setInterval(() => {
      this.detectDevToolsByConsole();
    }, 1000);

    console.log('🔒 Fallback DevTools protection initialized');
  }

  /**
   * Detect developer tools using console monitoring
   */
  private detectDevToolsByConsole(): void {
    const threshold = 160; // Pixel difference threshold
    
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
      this.handleDevToolsDetected();
    }
  }

  /**
   * Handle when developer tools are detected
   */
  private handleDevToolsDetected(): void {
    // Clear the page content
    document.body.innerHTML = '';
    
    // Create warning message
    const warningDiv = document.createElement('div');
    warningDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, #dc2626, #991b1b);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 999999;
    `;

    warningDiv.innerHTML = `
      <div style="text-align: center; max-width: 600px; padding: 2rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🚫</div>
        <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem;">
          Developer Tools Detected
        </h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9;">
          For security reasons, developer tools are not allowed during exams.
        </p>
        <p style="font-size: 1rem; opacity: 0.8;">
          Please close developer tools and refresh the page.
        </p>
        <button onclick="window.location.reload()" style="
          margin-top: 2rem;
          background: rgba(255,255,255,0.2);
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
           onmouseout="this.style.background='rgba(255,255,255,0.2)'">
          Refresh Page
        </button>
      </div>
    `;

    document.body.appendChild(warningDiv);

    // Also redirect after a delay
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }

  /**
   * Disable mobile/tablet responsive behavior
   */
  public disableResponsive(): void {
    // Add meta viewport to force desktop view
    let viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=1200, initial-scale=1, user-scalable=no');
    } else {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      viewport.setAttribute('content', 'width=1200, initial-scale=1, user-scalable=no');
      document.head.appendChild(viewport);
    }

    // Add CSS to force desktop layout
    const style = document.createElement('style');
    style.textContent = `
      /* Force desktop layout - disable responsive */
      * {
        min-width: auto !important;
      }
      
      body {
        min-width: 1200px !important;
        overflow-x: auto !important;
      }
      
      /* Override common responsive breakpoints */
      @media (max-width: 768px) {
        .container, .mx-auto {
          max-width: 1200px !important;
          padding-left: 1rem !important;
          padding-right: 1rem !important;
        }
      }
      
      @media (max-width: 640px) {
        .container, .mx-auto {
          max-width: 1200px !important;
        }
      }
      
      /* Force grid layouts to maintain desktop columns */
      .grid {
        display: grid !important;
      }
      
      .grid-cols-1 {
        grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
      }
      
      .md\\:grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
      
      .md\\:grid-cols-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }
      
      .lg\\:grid-cols-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }
      
      .lg\\:grid-cols-4 {
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      }
      
      /* Force flex layouts */
      .flex-col {
        flex-direction: row !important;
      }
      
      .sm\\:flex-row {
        flex-direction: row !important;
      }
      
      /* Force text sizes */
      .text-sm {
        font-size: 0.875rem !important;
      }
      
      .text-base {
        font-size: 1rem !important;
      }
      
      .text-lg {
        font-size: 1.125rem !important;
      }
      
      .text-xl {
        font-size: 1.25rem !important;
      }
      
      .text-2xl {
        font-size: 1.5rem !important;
      }
      
      .text-3xl {
        font-size: 1.875rem !important;
      }
      
      .text-4xl {
        font-size: 2.25rem !important;
      }
      
      .text-5xl {
        font-size: 3rem !important;
      }
      
      /* Disable touch/mobile interactions */
      * {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -khtml-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      input, textarea, select {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);

    console.log('📱 Responsive design disabled - forced desktop layout');
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this.detectInterval) {
      clearInterval(this.detectInterval);
      this.detectInterval = null;
    }
  }
}

// Global instance
export const devToolsDisabler = new DevToolsDisabler(); 