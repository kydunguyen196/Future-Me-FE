import { MathfieldElement } from 'mathlive';

// Configure MathLive with the correct font paths
if (typeof window !== 'undefined') {
  (window as any).MathfieldElement = (window as any).MathfieldElement || {};
  (window as any).MathfieldElement.fontsDirectory = '/fonts';
}

export { MathfieldElement }; 