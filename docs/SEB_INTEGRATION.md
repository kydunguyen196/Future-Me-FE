# Safe Exam Browser (SEB) Integration

This documentation explains how to integrate and use Safe Exam Browser detection in your React application to ensure exams are taken in a secure environment.

## Overview

The SEB integration module provides:
- **Automatic browser detection** - Identifies if the user is using Safe Exam Browser
- **Security validation** - Verifies proper SEB configuration and settings
- **Development toggle** - Easy to disable during development
- **Multiple detection methods** - User agent, headers, and window properties
- **Flexible implementation** - Can be used at app, route, or component level

## Quick Start

### 1. Basic Setup

The SEB Guard is already integrated into your app at the top level (`src/App.tsx`):

```tsx
import SEBGuard from './components/SEBGuard';

function App() {
  return (
    <SEBGuard 
      protectedRoutes={['/test', '/exam', '/protected/test', '/protected/exam']}
      customErrorMessage="This exam platform requires Safe Exam Browser to ensure academic integrity."
    >
      <YourAppContent />
    </SEBGuard>
  );
}
```

### 2. Development Configuration

Control SEB enforcement through `src/config/development.ts`:

```typescript
export const DEVELOPMENT_CONFIG = {
  // Set to true to enforce SEB even in development
  SEB_ENFORCEMENT_ENABLED: false, 
  
  // Set to true for stricter validation
  SEB_STRICT_MODE: false,
  
  // Helper function
  shouldEnforceSEB: () => {
    // In production, always enforce SEB
    if (DEVELOPMENT_CONFIG.IS_PRODUCTION) {
      return true;
    }
    // In development, only enforce if explicitly enabled
    return DEVELOPMENT_CONFIG.SEB_ENFORCEMENT_ENABLED;
  }
};
```

### 3. Toggle During Development

**Option A: Configuration File**
```typescript
// In src/config/development.ts
SEB_ENFORCEMENT_ENABLED: false, // Disable for development
SEB_ENFORCEMENT_ENABLED: true,  // Enable for testing
```

**Option B: Development Tools (Browser Console)**
```javascript
// Disable SEB enforcement
sebDevUtils.disableSEBEnforcement();

// Enable SEB enforcement
sebDevUtils.enableSEBEnforcement();

// Simulate SEB environment for testing
sebDevUtils.simulateSEB();

// Test current detection
sebDevUtils.testDetection();
```

**Option C: UI Development Panel**
- Click the floating shield/eye icon in development mode
- Use the control panel to toggle enforcement
- View real-time detection status

## Usage Patterns

### 1. App-Level Protection (Recommended)

Protects specific routes automatically:

```tsx
<SEBGuard 
  protectedRoutes={['/test', '/exam']}
  customErrorMessage="Custom error message"
  onValidationFailed={(result) => console.log('SEB failed:', result)}
  onValidationSuccess={(result) => console.log('SEB valid:', result)}
>
  <App />
</SEBGuard>
```

### 2. Component-Level Protection

For individual components:

```tsx
import { useSEBDetection } from '@/examples/SEBUsageExample';

function ExamComponent() {
  const { isValid, isLoading, errors } = useSEBDetection();
  
  if (isLoading) return <div>Checking security...</div>;
  if (!isValid) return <div>SEB required</div>;
  
  return <div>Secure exam content</div>;
}
```

### 3. Manual Validation

For specific actions:

```tsx
import { validateSEBAccess } from '@/utils/sebDetection';

const handleStartExam = () => {
  const sebStatus = validateSEBAccess();
  
  if (!sebStatus.isValid) {
    alert('Please use Safe Exam Browser');
    return;
  }
  
  // Proceed with exam
};
```

### 4. Route Guard

Protect entire routes:

```tsx
import { ProtectedExamRoute } from '@/examples/SEBUsageExample';

<Route path="/exam" element={
  <ProtectedExamRoute>
    <ExamPage />
  </ProtectedExamRoute>
} />
```

## API Reference

### `validateSEBAccess()`

Returns current SEB detection status:

```typescript
interface SEBDetectionResult {
  isSEB: boolean;           // Is Safe Exam Browser detected?
  isValid: boolean;         // Is the configuration valid?
  detectionMethod: string;  // How was SEB detected?
  errors: string[];         // Validation errors
  warnings: string[];       // Warnings (e.g., dev mode)
}
```

### `requireSEB()`

Blocks access if SEB is not valid:

```typescript
const isAllowed = requireSEB(); // Returns boolean, shows blocking overlay if false
```

### `sebDevUtils`

Development utilities:

```typescript
sebDevUtils.enableSEBEnforcement()    // Enable enforcement
sebDevUtils.disableSEBEnforcement()   // Disable enforcement
sebDevUtils.isEnforcementEnabled()    // Check status
sebDevUtils.simulateSEB()             // Simulate SEB environment
sebDevUtils.testDetection()           // Log detection results
```

### `SEBGuard` Component Props

```typescript
interface SEBGuardProps {
  children: React.ReactNode;
  protectedRoutes?: string[];           // Routes to protect
  showDevControls?: boolean;            // Show dev panel
  customErrorMessage?: string;          // Custom error text
  onValidationFailed?: (result) => void; // Failure callback
  onValidationSuccess?: (result) => void; // Success callback
}
```

## Detection Methods

The module uses multiple detection methods:

### 1. User Agent Detection
- Checks for "SEB" or "SafeExamBrowser" in user agent
- Can validate custom user agent suffixes
- Easiest to implement but least secure

### 2. Custom Headers
- Looks for SEB-specific HTTP headers
- More secure than user agent alone
- Requires proper SEB configuration

### 3. Browser Environment
- Checks for SEB-specific window properties
- Validates disabled developer tools
- Detects restricted functionality

### 4. Browser Exam Key (Future)
- Validates cryptographic keys
- Ensures correct SEB version and settings
- Most secure method

## Security Considerations

### Development vs Production

**Development Mode:**
- SEB enforcement is **disabled by default**
- Can be toggled easily for testing
- Shows development controls
- Displays warnings about bypass mode

**Production Mode:**
- SEB enforcement is **always enabled**
- Cannot be disabled through UI
- No development controls shown
- Full security validation active

### Best Practices

1. **Always test with SEB** before production deployment
2. **Use HTTPS** for all exam-related routes
3. **Validate server-side** as well as client-side
4. **Log security events** for monitoring
5. **Provide clear instructions** to users about SEB requirements

## Troubleshooting

### Common Issues

**"SEB not detected" in development:**
- Check `DEVELOPMENT_CONFIG.SEB_ENFORCEMENT_ENABLED`
- Use `sebDevUtils.disableSEBEnforcement()` in console
- Verify you're not on a protected route unnecessarily

**SEB detected but validation fails:**
- Check for proper SEB configuration
- Verify user agent contains "SEB"
- Ensure no browser extensions interfere

**Development controls not showing:**
- Check `showDevControls` prop on SEBGuard
- Verify you're not in production mode
- Look for floating shield/eye icon

### Debug Information

Enable detailed logging:

```typescript
// Check current status
console.log(validateSEBAccess());

// Test all detection methods
sebDevUtils.testDetection();

// Check configuration
console.log(DEVELOPMENT_CONFIG);
```

## Advanced Configuration

### Custom SEB Configuration

```typescript
import { SEBDetector } from '@/utils/sebDetection';

const customDetector = new SEBDetector({
  userAgentKeywords: ['SEB', 'CustomBrowser'],
  customUserAgentSuffix: 'MyExamPlatform/1.0',
  browserExamKeys: ['your-bek-hash-here'],
  requiredHeaders: ['X-SafeExamBrowser-RequestHash'],
  strictMode: true
});
```

### Server-Side Validation

For production, complement client-side detection with server-side validation:

```javascript
// Express.js example
app.use('/api/exam', (req, res, next) => {
  const userAgent = req.headers['user-agent'];
  const sebHeader = req.headers['x-safeexambrowser-requesthash'];
  
  if (!userAgent.includes('SEB') || !sebHeader) {
    return res.status(403).json({ error: 'SEB required' });
  }
  
  next();
});
```

### Custom Error Pages

Create custom error components:

```tsx
const CustomSEBError = ({ errors }) => (
  <div className="custom-seb-error">
    <h1>Secure Browser Required</h1>
    <p>Please download Safe Exam Browser from:</p>
    <a href="https://safeexambrowser.org">safeexambrowser.org</a>
    {/* Custom content */}
  </div>
);

<SEBGuard customErrorComponent={CustomSEBError}>
  <App />
</SEBGuard>
```

## Examples

See `src/examples/SEBUsageExample.tsx` for complete working examples of:
- Component-level protection
- Custom hooks
- Development tools
- Route guards
- Manual validation

## Support

For issues or questions:
1. Check the browser console for debug information
2. Use the development tools panel
3. Review the detection results with `sebDevUtils.testDetection()`
4. Verify your SEB configuration matches the expected format 