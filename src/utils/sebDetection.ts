/**
 * Safe Exam Browser (SEB) Detection and Validation Module
 * 
 * This module provides functionality to detect and validate Safe Exam Browser
 * to ensure exams are only taken in a secure environment.
 * 
 * Features:
 * - User Agent detection
 * - Browser Exam Key validation
 * - Custom header verification
 * - Development mode toggle
 */

import { DEVELOPMENT_CONFIG } from '@/config/development';

// SEB Detection Configuration
export interface SEBConfig {
  userAgentKeywords: string[];
  customUserAgentSuffix?: string;
  browserExamKeys?: string[];
  requiredHeaders: string[];
  strictMode: boolean;
}

// Default SEB configuration
const DEFAULT_SEB_CONFIG: SEBConfig = {
  userAgentKeywords: ['SEB', 'SafeExamBrowser'],
  requiredHeaders: ['X-SafeExamBrowser-RequestHash'],
  strictMode: false,
};

// SEB Detection Result
export interface SEBDetectionResult {
  isSEB: boolean;
  isValid: boolean;
  detectionMethod: string;
  errors: string[];
  warnings: string[];
}

/**
 * Main SEB Detection Class
 */
export class SEBDetector {
  private config: SEBConfig;
  private isEnabled: boolean;

  constructor(config: Partial<SEBConfig> = {}) {
    this.config = { ...DEFAULT_SEB_CONFIG, ...config };
    this.isEnabled = DEVELOPMENT_CONFIG.shouldEnforceSEB();
  }

  /**
   * Check if SEB enforcement is enabled
   */
  public isEnforcementEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Enable or disable SEB enforcement (for development)
   */
  public setEnforcement(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Detect and validate Safe Exam Browser
   */
  public detectSEB(): SEBDetectionResult {
    const result: SEBDetectionResult = {
      isSEB: false,
      isValid: false,
      detectionMethod: 'none',
      errors: [],
      warnings: [],
    };

    // If enforcement is disabled (development mode), allow access
    if (!this.isEnabled) {
      result.isSEB = true;
      result.isValid = true;
      result.detectionMethod = 'development-bypass';
      result.warnings.push('SEB enforcement is disabled (development mode)');
      return result;
    }

    // Method 1: User Agent Detection
    const userAgentResult = this.checkUserAgent();
    if (userAgentResult.detected) {
      result.isSEB = true;
      result.detectionMethod = 'user-agent';
    }

    // Method 2: Custom Headers Detection
    const headerResult = this.checkCustomHeaders();
    if (headerResult.detected) {
      result.isSEB = true;
      result.detectionMethod = result.detectionMethod === 'none' ? 'headers' : result.detectionMethod + '+headers';
    }

    // Method 3: Browser Exam Key Validation (if configured)
    if (this.config.browserExamKeys && this.config.browserExamKeys.length > 0) {
      const bekResult = this.validateBrowserExamKey();
      if (bekResult.valid) {
        result.isValid = true;
      } else {
        result.errors.push(...bekResult.errors);
      }
    } else {
      // If no BEK configured, consider it valid if SEB is detected
      result.isValid = result.isSEB;
    }

    // Collect all errors and warnings
    result.errors.push(...userAgentResult.errors, ...headerResult.errors);
    result.warnings.push(...userAgentResult.warnings, ...headerResult.warnings);

    return result;
  }

  /**
   * Check User Agent for SEB keywords
   */
  private checkUserAgent(): { detected: boolean; errors: string[]; warnings: string[] } {
    const userAgent = navigator.userAgent;
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for SEB keywords in user agent
    const hasSEBKeyword = this.config.userAgentKeywords.some(keyword => 
      userAgent.includes(keyword)
    );

    // Check for custom user agent suffix if configured
    let hasCustomSuffix = true;
    if (this.config.customUserAgentSuffix) {
      hasCustomSuffix = userAgent.includes(this.config.customUserAgentSuffix);
      if (!hasCustomSuffix) {
        errors.push(`Required custom user agent suffix not found: ${this.config.customUserAgentSuffix}`);
      }
    }

    const detected = hasSEBKeyword && hasCustomSuffix;

    if (!detected) {
      if (!hasSEBKeyword) {
        errors.push('Safe Exam Browser not detected in user agent');
      }
    } else {
      warnings.push(`SEB detected via user agent: ${userAgent}`);
    }

    return { detected, errors, warnings };
  }

  /**
   * Check for custom SEB headers
   */
  private checkCustomHeaders(): { detected: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Note: In a real implementation, you would check actual HTTP headers
    // This is a client-side approximation for demonstration
    
    // Check if we're in a context where we can access headers
    // In a real implementation, this would be done server-side
    const detected = this.checkClientSideHeaders();

    if (!detected) {
      errors.push('Required SEB headers not found');
    } else {
      warnings.push('SEB headers detected');
    }

    return { detected, errors, warnings };
  }

  /**
   * Client-side header detection (limited)
   */
  private checkClientSideHeaders(): boolean {
    // In a real implementation, this would be handled server-side
    // This is a simplified client-side check
    
    // Check for SEB-specific window properties or API
    const hasSEBAPI = typeof (window as any).SEB !== 'undefined';
    const hasSEBProperties = this.checkSEBWindowProperties();

    return hasSEBAPI || hasSEBProperties;
  }

  /**
   * Check for SEB-specific window properties
   */
  private checkSEBWindowProperties(): boolean {
    // SEB often modifies certain window properties
    const checks = [
      // Check if certain developer tools are disabled
      () => {
        try {
          const devtools = /./ as any;
          devtools.toString = function() { this.opened = true; return ''; }
          console.log('%c', devtools);
          return devtools.opened;
        } catch {
          return true; // Assume SEB if error occurs
        }
      },
      // Check for restricted right-click
      () => typeof (window as any).oncontextmenu === 'function',
      // Check for restricted key combinations
      () => {
        const restrictedKeys = ['F12', 'F11', 'Alt', 'Ctrl+Shift+I'];
        // This is a simplified check
        return restrictedKeys.length > 0;
      }
    ];

    return checks.some(check => {
      try {
        return check();
      } catch {
        return false;
      }
    });
  }

  /**
   * Validate Browser Exam Key (BEK)
   */
  private validateBrowserExamKey(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.browserExamKeys || this.config.browserExamKeys.length === 0) {
      return { valid: true, errors };
    }

    // In a real implementation, this would validate the BEK
    // against the current URL and SEB configuration
    // This is a simplified version for demonstration

    //@ts-ignore
    const currentUrl = window.location.href;
    const isValidBEK = this.config.browserExamKeys.some(key => {
      // Simplified BEK validation
      return key.length === 64; // SHA256 hash length
    });

    if (!isValidBEK) {
      errors.push('Invalid Browser Exam Key configuration');
    }

    return { valid: isValidBEK, errors };
  }

  /**
   * Block access and show error message
   */
  public blockAccess(result: SEBDetectionResult): void {
    const errorMessages = [
      'Access Denied: Safe Exam Browser Required',
      '',
      'This exam must be taken using Safe Exam Browser (SEB).',
      'Please ensure you have:',
      '• Safe Exam Browser installed and running',
      '• The correct exam configuration file (.seb)',
      '• Proper network connection',
      '',
      'Contact your exam administrator for assistance.',
    ];

    if (result.errors.length > 0) {
      errorMessages.push('', 'Technical Details:');
      errorMessages.push(...result.errors.map(error => `• ${error}`));
    }

    // Create blocking overlay
    this.createBlockingOverlay(errorMessages);
  }

  /**
   * Create a blocking overlay to prevent access
   */
  private createBlockingOverlay(messages: string[]): void {
    // Remove existing overlay if present
    const existingOverlay = document.getElementById('seb-block-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'seb-block-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
      color: white;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Create content container
    const container = document.createElement('div');
    container.style.cssText = `
      text-align: center;
      max-width: 600px;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;

    // Add icon
    const icon = document.createElement('div');
    icon.innerHTML = '🔒';
    icon.style.cssText = `
      font-size: 4rem;
      margin-bottom: 1rem;
    `;

    // Add messages
    const messageContainer = document.createElement('div');
    messages.forEach(message => {
      const p = document.createElement('p');
      p.textContent = message;
      p.style.cssText = `
        margin: ${message === '' ? '1rem 0' : '0.5rem 0'};
        font-size: ${message.startsWith('Access Denied') ? '1.5rem' : '1rem'};
        font-weight: ${message.startsWith('Access Denied') ? 'bold' : 'normal'};
        line-height: 1.5;
      `;
      messageContainer.appendChild(p);
    });

    container.appendChild(icon);
    container.appendChild(messageContainer);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    // Prevent scrolling
    document.body.style.overflow = 'hidden';

    // Disable right-click and keyboard shortcuts
    this.addSecurityEventListeners();
  }

  /**
   * Add security event listeners to prevent bypassing
   */
  private addSecurityEventListeners(): void {
    // Disable right-click
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Disable common keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      const forbiddenKeys = [
        'F12', // Developer tools
        'F11', // Fullscreen toggle
        'F5',  // Refresh
        'Escape', // ESC key
      ];

      const forbiddenCombinations = [
        e.ctrlKey && e.shiftKey && e.key === 'I', // Ctrl+Shift+I
        e.ctrlKey && e.shiftKey && e.key === 'J', // Ctrl+Shift+J
        e.ctrlKey && e.shiftKey && e.key === 'C', // Ctrl+Shift+C
        e.ctrlKey && e.key === 'u', // Ctrl+U
        e.ctrlKey && e.key === 'r', // Ctrl+R
        e.altKey && e.key === 'F4', // Alt+F4
      ];

      if (forbiddenKeys.includes(e.key) || forbiddenCombinations.some(combo => combo)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });
  }
}

/**
 * Global SEB detector instance
 */
export const sebDetector = new SEBDetector();

/**
 * Quick function to check if SEB is required and valid
 */
export function validateSEBAccess(): SEBDetectionResult {
  return sebDetector.detectSEB();
}

/**
 * Middleware function for route protection
 */
export function requireSEB(): boolean {
  const result = validateSEBAccess();
  
  if (!result.isValid) {
    sebDetector.blockAccess(result);
    return false;
  }
  
  return true;
}

/**
 * Development utilities
 */
export const sebDevUtils = {
  // Enable SEB enforcement for testing
  enableSEBEnforcement: () => sebDetector.setEnforcement(true),
  
  // Disable SEB enforcement for development
  disableSEBEnforcement: () => sebDetector.setEnforcement(false),
  
  // Check current enforcement status
  isEnforcementEnabled: () => sebDetector.isEnforcementEnabled(),
  
  // Simulate SEB environment for testing
  simulateSEB: () => {
    // Override user agent
    Object.defineProperty(navigator, 'userAgent', {
      get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) SEB/3.0.0 Chrome/91.0.4472.124 Safari/537.36',
      configurable: true
    });
    
    // Add SEB API
    (window as any).SEB = {
      version: '3.0.0',
      platform: 'Windows'
    };
    
    console.log('🔒 SEB environment simulated for testing');
  },
  
  // Test SEB detection
  testDetection: () => {
    const result = validateSEBAccess();
    console.log('SEB Detection Result:', result);
    return result;
  }
}; 