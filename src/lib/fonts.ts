// Font loading configuration
export const configureFonts = () => {
  if (typeof window !== 'undefined') {
    // Configure MathLive fonts
    (window as any).MathfieldElement = (window as any).MathfieldElement || {};
    (window as any).MathfieldElement.fontsDirectory = '/fonts';

    // Add font preload links
    const fontFiles = [
      'KaTeX_Main-Regular.woff2',
      'KaTeX_Math-Italic.woff2',
      'KaTeX_Main-Bold.woff2',
      'KaTeX_Main-BoldItalic.woff2',
      'KaTeX_Math-BoldItalic.woff2',
      'KaTeX_SansSerif-Regular.woff2',
      'KaTeX_SansSerif-Bold.woff2',
      'KaTeX_SansSerif-Italic.woff2',
      'KaTeX_Typewriter-Regular.woff2',
      'KaTeX_AMS-Regular.woff2',
      'KaTeX_Caligraphic-Regular.woff2',
      'KaTeX_Caligraphic-Bold.woff2',
      'KaTeX_Fraktur-Regular.woff2',
      'KaTeX_Fraktur-Bold.woff2',
      'KaTeX_Script-Regular.woff2',
      'KaTeX_Size1-Regular.woff2',
      'KaTeX_Size2-Regular.woff2',
      'KaTeX_Size3-Regular.woff2',
      'KaTeX_Size4-Regular.woff2'
    ];

    // Add preload links for fonts
    fontFiles.forEach(fontFile => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = `/fonts/${fontFile}`;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }
}; 