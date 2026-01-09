/**
 * SEB Usage Examples
 * 
 * This file demonstrates various ways to integrate Safe Exam Browser detection
 * into your React components and application.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateSEBAccess, requireSEB, sebDevUtils, type SEBDetectionResult } from '@/utils/sebDetection';
import { Shield, AlertTriangle, CheckCircle, Settings } from 'lucide-react';

// Example 1: Component-level SEB check
export const ExamComponent: React.FC = () => {
  const [sebStatus, setSebStatus] = useState<SEBDetectionResult | null>(null);
  //@ts-ignore
  const navigate = useNavigate();

  useEffect(() => {
    // Check SEB status when component mounts
    const status = validateSEBAccess();
    setSebStatus(status);

    // If SEB is not valid, redirect or show error
    if (!status.isValid) {
      console.warn('SEB validation failed:', status.errors);
      // Could redirect to a help page or show inline error
    }
  }, []);

  if (!sebStatus?.isValid) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-semibold">Security Check Failed</h3>
        </div>
        <p className="text-red-700">
          This exam requires Safe Exam Browser. Please launch the exam using the provided .seb file.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 text-green-600 mb-4">
        <CheckCircle className="w-5 h-5" />
        <span>Secure environment verified</span>
      </div>
      <h1 className="text-2xl font-bold mb-4">SAT Practice Exam</h1>
      <p>You can now proceed with your exam in a secure environment.</p>
      {/* Exam content would go here */}
    </div>
  );
};

// Example 2: Route guard component
export const ProtectedExamRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Use the requireSEB utility for route protection
    const isAllowed = requireSEB();
    
    if (!isAllowed) {
      // User will see the blocking overlay
      // Optionally log this event
      console.warn('User attempted to access exam without SEB');
    }
  }, [navigate]);

  // If we get here, SEB validation passed or is disabled
  return <>{children}</>;
};

// Example 3: Custom hook for SEB detection
export const useSEBDetection = () => {
  const [sebStatus, setSebStatus] = useState<SEBDetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSEB = async () => {
      setIsLoading(true);
      
      // Small delay to ensure proper initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const status = validateSEBAccess();
      setSebStatus(status);
      setIsLoading(false);
    };

    checkSEB();

    // Optional: Re-check periodically
    const interval = setInterval(checkSEB, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    sebStatus,
    isLoading,
    isValid: sebStatus?.isValid ?? false,
    isSEB: sebStatus?.isSEB ?? false,
    errors: sebStatus?.errors ?? [],
    warnings: sebStatus?.warnings ?? [],
  };
};

// Example 4: Component using the custom hook
export const ExamDashboard: React.FC = () => {
  const { sebStatus, isLoading, isValid } = useSEBDetection();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-spin" />
          <div>Verifying secure environment...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Exam Dashboard</h1>
        
        {/* Security status indicator */}
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          isValid 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {isValid ? (
            <>
              <Shield className="w-5 h-5" />
              <span>Secure browser environment active</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5" />
              <span>Security check failed - using {sebStatus?.detectionMethod || 'unknown method'}</span>
            </>
          )}
        </div>
      </div>

      {/* Show available exams only if secure */}
      {isValid ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ExamCard title="SAT Math Practice" duration="60 minutes" />
          <ExamCard title="SAT Reading & Writing" duration="90 minutes" />
          <ExamCard title="Full SAT Practice Test" duration="3 hours" />
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">
            Please use Safe Exam Browser to access your exams.
          </p>
        </div>
      )}
    </div>
  );
};

// Example 5: Simple exam card component
const ExamCard: React.FC<{ title: string; duration: string }> = ({ title, duration }) => {
  const handleStartExam = () => {
    // Double-check SEB before starting exam
    const sebStatus = validateSEBAccess();
    
    if (!sebStatus.isValid) {
      alert('Please ensure you are using Safe Exam Browser before starting the exam.');
      return;
    }

    // Start exam
    console.log(`Starting exam: ${title}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">Duration: {duration}</p>
      <button
        onClick={handleStartExam}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Start Exam
      </button>
    </div>
  );
};

// Example 6: Development utilities component
export const SEBDevelopmentTools: React.FC = () => {
  const [status, setStatus] = useState<SEBDetectionResult | null>(null);

  const refreshStatus = () => {
    setStatus(validateSEBAccess());
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  return (
    <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5" />
        <h3 className="text-lg font-semibold">SEB Development Tools</h3>
      </div>

      <div className="space-y-4">
        {/* Current status */}
        <div>
          <h4 className="font-medium mb-2">Current Status</h4>
          <div className="bg-white p-3 rounded border">
            <div className="text-sm space-y-1">
              <div>Valid: <span className={status?.isValid ? 'text-green-600' : 'text-red-600'}>
                {status?.isValid ? 'Yes' : 'No'}
              </span></div>
              <div>Method: {status?.detectionMethod || 'none'}</div>
              <div>Enforcement: <span className={sebDevUtils.isEnforcementEnabled() ? 'text-red-600' : 'text-green-600'}>
                {sebDevUtils.isEnforcementEnabled() ? 'Enabled' : 'Disabled'}
              </span></div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div>
          <h4 className="font-medium mb-2">Controls</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sebDevUtils.enableSEBEnforcement();
                refreshStatus();
              }}
              className="bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700"
            >
              Enable Enforcement
            </button>
            <button
              onClick={() => {
                sebDevUtils.disableSEBEnforcement();
                refreshStatus();
              }}
              className="bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700"
            >
              Disable Enforcement
            </button>
            <button
              onClick={() => {
                sebDevUtils.simulateSEB();
                refreshStatus();
              }}
              className="bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
            >
              Simulate SEB
            </button>
            <button
              onClick={() => {
                sebDevUtils.testDetection();
                refreshStatus();
              }}
              className="bg-purple-600 text-white py-2 px-3 rounded text-sm hover:bg-purple-700"
            >
              Test Detection
            </button>
          </div>
        </div>

        {/* Errors and warnings */}
        {status?.errors && status.errors.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 text-red-600">Errors</h4>
            <ul className="text-sm text-red-700 bg-red-50 p-2 rounded">
              {status.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {status?.warnings && status.warnings.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 text-yellow-600">Warnings</h4>
            <ul className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
              {status.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Example usage instructions as a comment:
/*
To use these examples in your application:

1. App-level protection (recommended):
   ```tsx
   import SEBGuard from '@/components/SEBGuard';
   
   function App() {
     return (
       <SEBGuard protectedRoutes={['/test', '/exam']}>
         <YourAppContent />
       </SEBGuard>
     );
   }
   ```

2. Route-level protection:
   ```tsx
   import { ProtectedExamRoute } from '@/examples/SEBUsageExample';
   
   <Route path="/exam" element={
     <ProtectedExamRoute>
       <ExamComponent />
     </ProtectedExamRoute>
   } />
   ```

3. Component-level checks:
   ```tsx
   import { useSEBDetection } from '@/examples/SEBUsageExample';
   
   function MyComponent() {
     const { isValid, sebStatus } = useSEBDetection();
     
     if (!isValid) {
       return <div>SEB required</div>;
     }
     
     return <div>Secure content</div>;
   }
   ```

4. Manual checks:
   ```tsx
   import { validateSEBAccess } from '@/utils/sebDetection';
   
   const handleSensitiveAction = () => {
     const sebStatus = validateSEBAccess();
     if (!sebStatus.isValid) {
       alert('This action requires Safe Exam Browser');
       return;
     }
     // Proceed with action
   };
   ```

5. Development tools:
   ```tsx
   import { SEBDevelopmentTools } from '@/examples/SEBUsageExample';
   
   // Add to your development pages
   <SEBDevelopmentTools />
   ```
*/ 