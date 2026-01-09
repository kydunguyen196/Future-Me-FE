import React, { useState, useEffect, useRef } from 'react';
import { Button } from './button';
import { Eye, EyeOff, Copy } from 'lucide-react';

// Simple MathField component wrapper
const MathFieldComponent: React.FC<any> = React.forwardRef((props, ref) => {
  return React.createElement('math-field', { ...props, ref });
});

interface LaTeXInputProps {
  value?: string;
  onChange?: (latex: string) => void;
  placeholder?: string;
  className?: string;
}

export const LaTeXInput: React.FC<LaTeXInputProps> = ({
  value = '',
  onChange,
  placeholder = 'Enter LaTeX equation (e.g., \\frac{1}{2}, x^2, \\sqrt{x})',
  className = ''
}) => {
  const [showPreview, setShowPreview] = useState(true);
  const [latexValue, setLatexValue] = useState(value);
  const mathFieldRef = useRef<any>(null);
  const [isMathLiveLoaded, setIsMathLiveLoaded] = useState(false);

  useEffect(() => {
    // Load MathLive dynamically and configure it
    const loadMathLive = async () => {
      try {
        const MathLive = await import('mathlive');
        
        // Configure MathLive settings to fix font loading
        if (typeof window !== 'undefined') {
          // Configure MathLive font loading
          try {
            // Set the fonts directory for MathLive
            (window as any).MathfieldElement = (window as any).MathfieldElement || {};
            (window as any).MathfieldElement.fontsDirectory = '/fonts';
            
            // Alternative configuration
            if (MathLive.renderMathInDocument) {
              MathLive.renderMathInDocument({
                TeX: {
                  delimiters: {
                    inline: [['\\(', '\\)'], ['$', '$']],
                    display: [['\\[', '\\]'], ['$$', '$$']]
                  }
                }
              });
            }
            
            console.log('MathLive loaded successfully with font configuration');
          } catch (fontError) {
            console.warn('MathLive font configuration failed, but MathLive still loaded:', fontError);
          }
        }
        
        setIsMathLiveLoaded(true);
      } catch (error) {
        console.error('Failed to load MathLive:', error);
        // Fallback: still allow the component to work without MathLive
        setIsMathLiveLoaded(false);
      }
    };

    loadMathLive();
  }, []);

  useEffect(() => {
    setLatexValue(value);
    if (mathFieldRef.current && isMathLiveLoaded) {
      mathFieldRef.current.value = value;
    }
  }, [value, isMathLiveLoaded]);

  const handleMathFieldInput = (event: any) => {
    const newValue = event.target.value;
    setLatexValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setLatexValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
    if (mathFieldRef.current && isMathLiveLoaded) {
      mathFieldRef.current.value = newValue;
    }
  };

  const copyAsInline = async () => {
    try {
      const inlineLatex = `\\(${latexValue}\\)`;
      await navigator.clipboard.writeText(inlineLatex);
    } catch (error) {
      console.error('Failed to copy inline LaTeX to clipboard:', error);
    }
  };

  const copyAsBlock = async () => {
    try {
      const blockLatex = `$$${latexValue}$$`;
      await navigator.clipboard.writeText(blockLatex);
    } catch (error) {
      console.error('Failed to copy block LaTeX to clipboard:', error);
    }
  };

  const copyRaw = async () => {
    try {
      await navigator.clipboard.writeText(latexValue);
    } catch (error) {
      console.error('Failed to copy raw LaTeX to clipboard:', error);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* MathField Editor */}
      {isMathLiveLoaded && (
        <div className="border border-gray-300 rounded-md bg-white">
          <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">Math Editor</span>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyAsInline}
                title="Copy as inline LaTeX: \(expression\)"
                className="text-xs px-2"
              >
                <Copy className="h-3 w-3 mr-1" />
                Inline
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyAsBlock}
                title="Copy as block LaTeX: $$expression$$"
                className="text-xs px-2"
              >
                <Copy className="h-3 w-3 mr-1" />
                Block
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyRaw}
                title="Copy raw LaTeX expression"
                className="text-xs px-2"
              >
                <Copy className="h-3 w-3 mr-1" />
                Raw
              </Button>
            </div>
          </div>
          
          <div className="p-4">
            <MathFieldComponent
              ref={mathFieldRef}
              onInput={handleMathFieldInput}
              style={{
                fontSize: '18px',
                border: 'none',
                outline: 'none',
                width: '100%',
                minHeight: '60px',
                fontFamily: 'Latin Modern Math, Computer Modern, serif'
              }}
              virtualKeyboardMode="off"
              smartMode={true}
              mathModeSpace="\\:"
            >
              {latexValue}
            </MathFieldComponent>
          </div>
        </div>
      )}

      {/* Fallback LaTeX Input for when MathLive is loading */}
      {!isMathLiveLoaded && (
        <div className="relative">
          <textarea
            value={latexValue}
            onChange={handleTextareaChange}
            placeholder={placeholder}
            className="w-full h-20 p-3 pr-32 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyAsInline}
              title="Copy as inline LaTeX: \(expression\)"
              className="text-xs px-2"
            >
              <Copy className="h-3 w-3 mr-1" />
              Inline
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyAsBlock}
              title="Copy as block LaTeX: $$expression$$"
              className="text-xs px-2"
            >
              <Copy className="h-3 w-3 mr-1" />
              Block
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyRaw}
              title="Copy raw LaTeX expression"
              className="text-xs px-2"
            >
              <Copy className="h-3 w-3 mr-1" />
              Raw
            </Button>
          </div>
        </div>
      )}

      {/* LaTeX Source View Toggle */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
          {showPreview ? 'Hide LaTeX Source' : 'Show LaTeX Source'}
        </Button>
      </div>

      {/* LaTeX Source Code View */}
      {showPreview && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            LaTeX Source Code:
          </label>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 font-mono text-sm">
            <code className="text-gray-800">{latexValue || 'No equation entered'}</code>
          </div>
        </div>
      )}

      {/* Quick Help */}
      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
        <div className="font-medium mb-1">Tips:</div>
        <ul className="space-y-1">
          <li>• Type directly: fractions (a/b), powers (x^2), roots (sqrt(x))</li>
          <li>• Use Greek letters: type "alpha", "beta", "pi", etc.</li>
          <li>• Smart mode automatically formats common expressions</li>
          <li>• Copy options: <strong>Inline</strong> \(expr\), <strong>Block</strong> $$expr$$, <strong>Raw</strong> expr</li>
        </ul>
      </div>
    </div>
  );
};

export default LaTeXInput; 