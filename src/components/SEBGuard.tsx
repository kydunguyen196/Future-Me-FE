/**
 * SEBGuard Component
 * 
 * A React component that wraps exam-related routes and ensures they can only
 * be accessed through Safe Exam Browser (SEB). This component integrates with
 * the SEB detection module and can be easily toggled off during development.
 */

import React, { useEffect, useState } from 'react';
import { validateSEBAccess, sebDevUtils, type SEBDetectionResult } from '@/utils/sebDetection';
import { DEVELOPMENT_CONFIG } from '@/config/development';
import { AlertTriangle, Shield, Settings, Eye } from 'lucide-react';

interface SEBGuardProps {
  children: React.ReactNode;
  /** Routes that require SEB protection */
  protectedRoutes?: string[];
  /** Show development controls when in development mode */
  showDevControls?: boolean;
  /** Custom error message */
  customErrorMessage?: string;
  /** Callback when SEB validation fails */
  onValidationFailed?: (result: SEBDetectionResult) => void;
  /** Callback when SEB validation succeeds */
  onValidationSuccess?: (result: SEBDetectionResult) => void;
}

const SEBGuard: React.FC<SEBGuardProps> = ({
  children,
  protectedRoutes = ['/test', '/exam'],
  showDevControls = DEVELOPMENT_CONFIG.SEB_SHOW_FLOATING_CONTROLS,
  customErrorMessage,
  onValidationFailed,
  onValidationSuccess,
}) => {
  const [sebStatus, setSebStatus] = useState<SEBDetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDevPanel, setShowDevPanel] = useState(false);

  // Check if current route requires SEB protection
  const requiresProtection = protectedRoutes.some(route => 
    window.location.pathname.startsWith(route)
  );

  useEffect(() => {
    const checkSEBStatus = () => {
      setIsLoading(true);
      
      // Delay check slightly to ensure page is loaded
      setTimeout(() => {
        const result = validateSEBAccess();
        setSebStatus(result);
        setIsLoading(false);

        // Call appropriate callback
        if (result.isValid) {
          onValidationSuccess?.(result);
        } else {
          onValidationFailed?.(result);
        }
      }, 100);
    };

    // Initial check
    checkSEBStatus();

    // Re-check periodically if in a protected route
    let interval: NodeJS.Timeout | null = null;
    if (requiresProtection && DEVELOPMENT_CONFIG.IS_PRODUCTION) {
      interval = setInterval(checkSEBStatus, 30000); // Check every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [requiresProtection, onValidationFailed, onValidationSuccess]);

  // Development controls
  const DevPanel = () => (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 z-50 min-w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Settings className="w-4 h-4" />
          SEB Development Controls
        </h3>
        <button
          onClick={() => setShowDevPanel(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-3 text-sm">
        <div>
          <strong>Status:</strong>{' '}
          <span className={`${sebStatus?.isValid ? 'text-green-600' : 'text-red-600'}`}>
            {sebStatus?.isValid ? 'Valid' : 'Invalid'}
          </span>
        </div>
        
        <div>
          <strong>Method:</strong> {sebStatus?.detectionMethod || 'none'}
        </div>
        
        <div>
          <strong>Enforcement:</strong>{' '}
          <span className={`${sebDevUtils.isEnforcementEnabled() ? 'text-red-600' : 'text-green-600'}`}>
            {sebDevUtils.isEnforcementEnabled() ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {sebStatus?.warnings && sebStatus.warnings.length > 0 && (
          <div>
            <strong>Warnings:</strong>
            <ul className="text-xs text-yellow-600 mt-1">
              {sebStatus.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {sebStatus?.errors && sebStatus.errors.length > 0 && (
          <div>
            <strong>Errors:</strong>
            <ul className="text-xs text-red-600 mt-1">
              {sebStatus.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t pt-3 space-y-2">
          <button
            onClick={() => {
              sebDevUtils.enableSEBEnforcement();
              window.location.reload();
            }}
            className="w-full bg-red-600 text-white py-1 px-2 rounded text-xs hover:bg-red-700"
          >
            Enable SEB Enforcement
          </button>
          
          <button
            onClick={() => {
              sebDevUtils.disableSEBEnforcement();
              window.location.reload();
            }}
            className="w-full bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700"
          >
            Disable SEB Enforcement
          </button>
          
          <button
            onClick={() => {
              sebDevUtils.simulateSEB();
              window.location.reload();
            }}
            className="w-full bg-blue-600 text-white py-1 px-2 rounded text-xs hover:bg-blue-700"
          >
            Simulate SEB Environment
          </button>
          
          <button
            onClick={() => {
              sebDevUtils.testDetection();
            }}
            className="w-full bg-purple-600 text-white py-1 px-2 rounded text-xs hover:bg-purple-700"
          >
            Test Detection (Console)
          </button>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <div className="text-lg font-medium">Initializing Security Check...</div>
          <div className="text-sm text-gray-600 mt-2">Verifying Safe Exam Browser</div>
        </div>
      </div>
    );
  }

  // If route doesn't require protection, just render children
  if (!requiresProtection) {
    return (
      <>
        {children}
        {showDevControls && (
          <button
            onClick={() => setShowDevPanel(!showDevPanel)}
            className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 z-40"
            title="SEB Development Controls"
          >
            <Eye className="w-5 h-5" />
          </button>
        )}
        {showDevControls && showDevPanel && <DevPanel />}
      </>
    );
  }

  // If SEB validation failed, show error
  if (!sebStatus?.isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-red-100 dark:from-red-950 dark:via-orange-950 dark:to-red-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Secure Browser Required
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {customErrorMessage || 'This exam requires Safe Exam Browser (SEB) to ensure test security.'}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 mb-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Required Actions:</h2>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  Download and install Safe Exam Browser from your institution
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  Launch the exam using the provided .seb configuration file
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  Ensure no other browsers or applications are running
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  Contact technical support if you continue to experience issues
                </li>
              </ul>
            </div>

            {sebStatus?.errors && sebStatus.errors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">Technical Details:</h3>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  {sebStatus.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Retry Security Check
              </button>
            </div>
          </div>
        </div>

        {/* Development controls for testing */}
        {showDevControls && (
          <>
            <button
              onClick={() => setShowDevPanel(!showDevPanel)}
              className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 z-40"
              title="SEB Development Controls"
            >
              <Settings className="w-5 h-5" />
            </button>
            {showDevPanel && <DevPanel />}
          </>
        )}
      </div>
    );
  }

  // SEB validation passed, render children with optional dev controls
  return (
    <>
      {children}
      {showDevControls && (
        <>
          <button
            onClick={() => setShowDevPanel(!showDevPanel)}
            className="fixed bottom-4 right-4 bg-green-600 text-white p-2 rounded-full shadow-lg hover:bg-green-700 z-40"
            title="SEB Development Controls"
          >
            <Shield className="w-5 h-5" />
          </button>
          {showDevPanel && <DevPanel />}
        </>
      )}
    </>
  );
};

export default SEBGuard; 