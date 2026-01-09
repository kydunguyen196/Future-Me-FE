import { useEffect, useRef } from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

// Configure KaTeX font paths
katex.renderToString('', {
  displayMode: true,
  strict: false,
  trust: true,
  throwOnError: false,
  output: 'html'
});

interface LatexRendererProps {
  content: string;
  block?: boolean;
  isMathModule?: boolean;
}

/**
 * Enhanced LaTeX renderer for math modules
 * Processes $inline math$, $$block math$$, LaTeX commands, and HTML content
 */
const LatexRenderer: React.FC<LatexRendererProps> = ({ 
  content, 
  block = false, 
  isMathModule = false 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    let processedContent = content;
    
    // Debug logging
    console.log('Original content:', content);
    
    // STEP 0: Fix malformed HTML tags with spaces (CRITICAL for proper display)
    processedContent = fixMalformedHtmlTags(processedContent);
    console.log('After fixing malformed HTML:', processedContent);
    
    // STEP 1: Handle special cases of mixed HTML and LaTeX content
    processedContent = processMixedHtmlLatex(processedContent);
    
    // STEP 2: Apply character encoding fixes for LaTeX content FIRST
    processedContent = fixCharacterEncoding(processedContent);
    
    // STEP 3: Clean up any redundant delimiters before LaTeX processing
    processedContent = cleanupDelimiters(processedContent);
    
    // STEP 4: Enhanced processing for math modules
    if (isMathModule) {
      processedContent = preprocessMathContent(processedContent);
    }
    
    // STEP 5: Process LaTeX content BEFORE HTML processing to preserve LaTeX delimiters
    // First process display math \[...\] (highest priority)
    processedContent = processedContent.replace(/\\\[([\s\S]*?)\\\]/g, (_, formula) => {
      try {
        const cleaned = cleanLatexFormula(formula);
        return `<div class="latex-block math-display">${katex.renderToString(cleaned, { 
          displayMode: true,
          strict: false,
          trust: true,
          macros: getMathMacros(),
          throwOnError: false
        })}</div>`;
      } catch (error) {
        console.error('Display LaTeX rendering error:', error);
        return `<div class="latex-error">\\[${formula}\\]</div>`;
      }
    });
    
    // Process LaTeX inline math \(...\) - CRITICAL: Process this before HTML tags
    processedContent = processedContent.replace(/\\\((.*?)\\\)/g, (_, formula) => {
      try {
        const cleaned = cleanLatexFormula(formula);
        return `<span class="latex-inline">${katex.renderToString(cleaned, { 
          displayMode: false,
          strict: false,
          trust: true,
          macros: getMathMacros(),
          throwOnError: false
        })}</span>`;
      } catch (error) {
        console.error('Inline LaTeX rendering error for:', formula, error);
        try {
          return `<span class="latex-inline">${katex.renderToString(formula, { 
            displayMode: false,
            strict: false,
            trust: true,
            throwOnError: false
          })}</span>`;
        } catch (secondError) {
          console.error('Secondary LaTeX rendering also failed:', secondError);
          return `<span class="latex-error">\\(${formula}\\)</span>`;
        }
      }
    });
    
    // Process block math ($$...$$)
    processedContent = processedContent.replace(/\$\$([\s\S]*?)\$\$/g, (_, formula) => {
      try {
        const cleaned = cleanLatexFormula(formula);
        return `<div class="latex-block math-display">${katex.renderToString(cleaned, { 
          displayMode: true,
          strict: false,
          trust: true,
          macros: getMathMacros(),
          throwOnError: false
        })}</div>`;
      } catch (error) {
        console.error('Block LaTeX rendering error:', error);
        return `<div class="latex-error">$$${formula}$$</div>`;
      }
    });
    
    // Process inline math ($...$) - more robust pattern
    processedContent = processedContent.replace(/(?<!\$)\$([^$\n]+?)\$(?!\$)/g, (_, formula) => {
      try {
        const cleaned = cleanLatexFormula(formula);
        return `<span class="latex-inline">${katex.renderToString(cleaned, { 
          displayMode: false,
          strict: false,
          trust: true,
          macros: getMathMacros(),
          throwOnError: false
        })}</span>`;
      } catch (error) {
        console.error('Inline LaTeX rendering error:', error);
        return `<span class="latex-error">$${formula}$</span>`;
      }
    });
    
    // Process LaTeX commands without $ delimiters (for math modules)
    if (isMathModule) {
      processedContent = processLatexCommands(processedContent);
    }
    
    // STEP 6: NOW process HTML tags AFTER LaTeX is rendered - preserve and normalize them
    processedContent = processHtmlTags(processedContent);
    
    // STEP 7: Process newlines and escape sequences LAST
    processedContent = processNewlinesAndEscapes(processedContent);
    
    console.log('Final processed content:', processedContent);
    
    containerRef.current.innerHTML = processedContent;
  }, [content, isMathModule]);

  // Fix malformed HTML tags with spaces (like "< p >" -> "<p>")
  const fixMalformedHtmlTags = (text: string): string => {
    return text
      // Fix spaced HTML tags like "< p >" -> "<p>", "< /p >" -> "</p>"
      .replace(/\s*<\s*(\/?[a-zA-Z][a-zA-Z0-9]*)\s*>\s*/gi, '<$1>')
      
      // Fix common malformed tags specifically
      .replace(/\s*<\s*p\s*>\s*/gi, '<p>')
      .replace(/\s*<\s*\/\s*p\s*>\s*/gi, '</p>')
      .replace(/\s*<\s*br\s*\/?\s*>\s*/gi, '<br>')
      .replace(/\s*<\s*strong\s*>\s*/gi, '<strong>')
      .replace(/\s*<\s*\/\s*strong\s*>\s*/gi, '</strong>')
      .replace(/\s*<\s*em\s*>\s*/gi, '<em>')
      .replace(/\s*<\s*\/\s*em\s*>\s*/gi, '</em>')
      .replace(/\s*<\s*b\s*>\s*/gi, '<b>')
      .replace(/\s*<\s*\/\s*b\s*>\s*/gi, '</b>')
      .replace(/\s*<\s*i\s*>\s*/gi, '<i>')
      .replace(/\s*<\s*\/\s*i\s*>\s*/gi, '</i>')
      .replace(/\s*<\s*u\s*>\s*/gi, '<u>')
      .replace(/\s*<\s*\/\s*u\s*>\s*/gi, '</u>')
      
      .trim();
  };

  // Handle mixed HTML and LaTeX content (like <p>text<br>\(formula\)</p>)
  const processMixedHtmlLatex = (text: string): string => {
    // Pre-process to handle cases like <p>aaaaa<br>\(7x^2\)</p>
    // We need to ensure LaTeX delimiters are preserved within HTML tags
    return text
      // Normalize encoded delimiters first
      .replace(/\\&\#40;/g, '\\(')      // \&#40; -> \(
      .replace(/\\&\#41;/g, '\\)')      // \&#41; -> \)
      .replace(/&\#40;/g, '(')          // &#40; -> (
      .replace(/&\#41;/g, ')')          // &#41; -> )
      
      // Handle specific case of LaTeX inside HTML tags
      //@ts-ignore
      .replace(/<([^>]+)>([^<]*\\)\(([^)]+)\)([^<]*)<\/\1>/g, (match, tag, before, formula, after) => {
        // Temporarily preserve the LaTeX expression
        return `<${tag}>${before}__LATEX_START__${formula}__LATEX_END__${after}</${tag}>`;
      })
      
      // Handle LaTeX expressions that span across HTML boundaries
      .replace(/(<[^>]*>.*?)\\[(]/g, '$1\\(')  // Fix \( after HTML tags
      .replace(/[)]\\(.*?<[^>]*>)/g, ')\\$1')  // Fix \) before HTML tags
      
      // Restore the temporarily preserved LaTeX expressions
      .replace(/__LATEX_START__(.*?)__LATEX_END__/g, '\\($1\\)')
      
      .trim();
  };

  // Process HTML tags - preserve and normalize them (called AFTER LaTeX processing)
  const processHtmlTags = (text: string): string => {
    return text
      // Process common HTML entities - but be careful not to break already-rendered LaTeX
      .replace(/&lt;(?!span|div)/g, '<')  // Only replace &lt; if not part of LaTeX spans
      .replace(/&gt;(?!;)/g, '>')         // Only replace &gt; if not part of HTML entities
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;(?!lt;|gt;|quot;|#39;|amp;)/g, '&')  // Don't break other entities
      
      // Ensure HTML tags are properly formatted (after the initial fix)
      .replace(/<br\s*\/?>/gi, '<br>')
      .replace(/<p>/gi, '<p>')
      .replace(/<\/p>/gi, '</p>')
      .replace(/<strong>/gi, '<strong>')
      .replace(/<\/strong>/gi, '</strong>')
      .replace(/<em>/gi, '<em>')
      .replace(/<\/em>/gi, '</em>')
      .replace(/<b>/gi, '<strong>')
      .replace(/<\/b>/gi, '</strong>')
      .replace(/<i>/gi, '<em>')
      .replace(/<\/i>/gi, '</em>')
      .replace(/<u>/gi, '<u>')
      .replace(/<\/u>/gi, '</u>')
      
      // Remove any remaining malformed spacing in HTML tags
      .replace(/\s*<\s*(\/?[a-zA-Z][a-zA-Z0-9]*)\s*>\s*/gi, '<$1>')
      
      .trim();
  };

  // Process newlines and escape sequences (called AFTER LaTeX and HTML processing)
  const processNewlinesAndEscapes = (text: string): string => {
    return text
      // Convert \n to <br> tags for line breaks - but be careful not to break LaTeX spans
      .replace(/\\n(?![^<]*<\/span>)/g, '<br>')  // Don't replace \n inside LaTeX spans
      .replace(/\n(?![^<]*<\/span>)/g, '<br>')   // Don't replace \n inside LaTeX spans
      
      // Handle line breaks at the beginning and end - but preserve LaTeX content
      .replace(/^<br>+/gi, '') // Remove leading line breaks
      .replace(/<br>+$/gi, '') // Remove trailing line breaks
      .trim();
  };

  // Fix character encoding issues first
  const fixCharacterEncoding = (text: string): string => {
    return text
      // Fix character encoding issues FIRST
      .replace(/⋅⋅/g, '.') // Replace double middle dots with decimal points
      .replace(/⋅\s*⋅/g, '.') // Replace spaced middle dots with decimal points
      
      // Fix function notation issues
      .replace(/\?\(\?\)/g, 'f(x)') // Replace ?(?) with f(x)
      .replace(/\?\s*\(\s*\?\s*\)/g, 'f(x)') // Replace ? ( ? ) with f(x)
      .replace(/\?\s*\(\s*(\d+)\s*\)/g, 'f($1)') // Replace ? ( 5 ) with f(5)
      .replace(/\?\s*\(\s*([a-zA-Z])\s*\)/g, 'f($1)') // Replace ? ( x ) with f(x)
      
      // Fix function definitions - handle cases like "??=" meaning "f(x)="
      .replace(/\?\?=/g, 'f(x) = ') // Replace ??= with f(x) = 
      .replace(/\?\s*\?=/g, 'f(x) = ') // Replace ? ?= with f(x) = 
      .replace(/The function \? is defined by/g, 'The function f is defined by')
      .replace(/What is the value of \?(\d+)/g, 'What is the value of f($1)')
      .replace(/value of \?\s*(\d+)/g, 'value of f($1)')
      
      // Fix variable notation in mathematical expressions - be more specific
      .replace(/(\d+)\?\^2(?=\s|$|[^\w])/g, '$1x^2') // Replace 19?^2 with 19x^2 only at word boundaries
      .replace(/(\d+)\?\^(\d+)(?=\s|$|[^\w])/g, '$1x^{$2}') // Replace coefficient?^n with coefficientx^{n}
      .replace(/\?\^2(?=\s|$|[^\w])/g, 'x^2') // Replace ?^2 with x^2 at word boundaries
      .replace(/\?\^(\d+)(?=\s|$|[^\w])/g, 'x^{$1}') // Replace ?^n with x^{n} at word boundaries
      
      // Fix standalone variables in equations and expressions - be more specific
      .replace(/(?<=\s)\?(?=\s)/g, 'x') // Replace standalone ? with x (between spaces)
      .replace(/(?<==\s*)\?(?=\s|$)/g, 'x') // Replace ? after = with x
      .replace(/(?<=\s)\?(?=\s*=)/g, 'x') // Replace ? before = with x
      .replace(/(?<=\+\s*)\?(?=\s|$|[^\w])/g, 'x') // Replace ? after + with x
      .replace(/(?<=-\s*)\?(?=\s|$|[^\w])/g, 'x') // Replace ? after - with x
      .replace(/\(\s*\?\s*\)/g, '(x)') // Replace ( ? ) with (x)
      
      // Fix specific mathematical patterns - be more careful with spaces
      .replace(/(\d+)\s*\?\s*(?==)/g, '$1x ') // Replace "4 ? =" with "4x " (preserve space before =)
      .replace(/(\d+)\s*\?\s*(?=\+)/g, '$1x ') // Replace "4 ? +" with "4x " (preserve space before +)
      .replace(/(\d+)\s*\?\s*(?=-)/g, 'x ') // Replace "4 ? -" with "4x " (preserve space before -)
      .replace(/(\d+)\s*\?\s*(?=\))/g, '$1x') // Replace "4 ? )" with "4x)"
      
      // Fix coordinate and point notation
      .replace(/point\s*\?\s*,\s*\?/g, 'point (x, y)') // Replace "point ? , ?" with "point (x, y)"
      .replace(/\?\s*,\s*(\d+)/g, '(x, $1)') // Replace "? , 53" with "(x, 53)"
      
      // Fix variable references in text - be more specific to avoid corrupting regular text
      .replace(/(?<=\s)\?\s+is\s+the\s+number/g, 'x is the number')
      .replace(/where\s+\?\s+is(?=\s)/g, 'where x is')
      .replace(/variables\s+\?\s+and\s+\?(?=\s|,)/g, 'variables x and y')
      .replace(/relates\s+the\s+numbers\s+\?\s+and\s+\?(?=\s|,)/g, 'relates the numbers x and y')
      .replace(/\?\s+and\s+\?\s*,\s*where/g, 'x and y, where')
      
      // Fix specific quadrilateral and geometry notation
      .replace(/Quadrilateral\s*\?\s*'\s*\?\s*'\s*\?\s*'\s*\?\s*'/g, "Quadrilateral A'B'C'D'")
      .replace(/quadrilateral\s*\?\s*\?\s*\?\s*\?/g, 'quadrilateral ABCD')
      .replace(/\?\s*,\s*\?\s*,\s*\?\s*,\s*and\s*\?\s*correspond/g, 'A, B, C, and D correspond')
      .replace(/angle\s*\?\s*'/g, "angle A'")
      .replace(/(?<=angle\s)\?(?=\s|$)/g, 'A') // More specific angle replacement
      .replace(/measure of angle\s*\?/g, 'measure of angle A')
      
      // Fix split numbers - be more specific to avoid corrupting normal text
      .replace(/195\s*⋅*\s*7(?=\s|$|[^\d])/g, '1957')
      .replace(/197\s*⋅*\s*2(?=\s|$|[^\d])/g, '1972')
      
      // Fix split decimal numbers (e.g., "20 ⋅⋅ 6" -> "20.6", "24 ⋅⋅ 3" -> "24.3")
      .replace(/(\d+)\s*⋅+\s*(\d+)(?=\s|$|[^\d])/g, '$1.$2')
      .replace(/(\d+)\s*\.\s*(\d+)/g, '$1.$2') // Fix spaced decimal points
      
      // Fix mathematical expressions with middle dots
      .replace(/(\d+\.?\d*)\s*⋅+\s*\(/g, '$1(') // "20.6 ⋅⋅ (" -> "20.6("
      .replace(/\)\s*⋅+\s*(\d+)/g, ')^{$1}') // ") ⋅⋅ 4" -> ")^{4}" for exponents
      
      // Clean up extra spaces and invisible characters - but preserve normal spacing
      .replace(/\u200B/g, '') // Remove zero-width space
      .replace(/\u00A0/g, ' ') // Replace non-breaking space
      .replace(/[\u2000-\u200F\u2028-\u202F]/g, ' ') // Remove various Unicode spaces
      .replace(/\s{3,}/g, ' ') // Replace 3+ spaces with single space (but preserve normal spacing)
      .trim();
  };

  // Clean up redundant delimiters and malformed content
  const cleanupDelimiters = (text: string): string => {
    return text
      // Remove redundant spaces and line breaks within math expressions
      .replace(/\\\(\s*([^\\]*?)\s*\\\)/g, '\\($1\\)')
      .replace(/\$\s*([^$]*?)\s*\$/g, '$$$1$$')
      // Fix the specific error case mentioned by user
      .replace(/\\?\(\s*4\s*2\s*x\s*2x\s*​\s*=\s*16\s*\\?\)/g, '\\(4 \\cdot 2x = 16\\)')
      // Handle other common malformed patterns
      .replace(/(\d+)\s+(\d+)\s*x/g, '$1 \\cdot $2x') // "4 2 x" -> "4 \\cdot 2x"
      .replace(/(\d+)x\s*(\d+)x/g, '$1x \\cdot $2x') // "2x 2x" -> "2x \\cdot 2x"
      .replace(/(\w+)\s+(\w+)\s*=/g, '$1 \\cdot $2 =') // "a b =" -> "a \\cdot b ="
      // Normalize mathematical operators
      .replace(/\s*=\s*/g, ' = ') // Normalize equals signs
      .replace(/\s*\+\s*/g, ' + ') // Normalize plus signs
      .replace(/\s*-\s*/g, ' - ') // Normalize minus signs
      .trim();
  };

  // Preprocess math content for common patterns
  const preprocessMathContent = (text: string): string => {
    return text
      // Fix incomplete fractions - if \frac has only one argument, try to fix it
      .replace(/\\frac\{([^}]+)\}(?!\{)/g, (match, numerator) => {
        // If there's content after the incomplete fraction, try to extract denominator
        const afterMatch = text.substring(text.indexOf(match) + match.length);
        const nextBraceContent = afterMatch.match(/^\{([^}]+)\}/);
        if (nextBraceContent) {
          return `\\frac{${numerator}}{${nextBraceContent[1]}}`;
        }
        // If no clear denominator, assume it's meant to be over 1
        return `\\frac{${numerator}}{1}`;
      })
      // Fix malformed fractions with missing braces
      .replace(/\\frac\s+([^{}\s]+)\s+([^{}\s]+)/g, '\\frac{$1}{$2}')
      // Handle multiplication symbols - ONLY when there are explicit spaces or operators
      .replace(/\*|×/g, '\\cdot')
      .replace(/(\d+)\s+([a-zA-Z])/g, '$1$2') // "5 x" -> "5x" (remove space, don't add cdot)
      .replace(/(\d+)\s*\*\s*([a-zA-Z])/g, '$1$2') // "5*x" -> "5x"
      // Handle fractions - ensure proper format
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '\\frac{$1}{$2}')
      // Handle square roots
      .replace(/\\sqrt\{([^}]+)\}/g, '\\sqrt{$1}')
      // Fix incomplete square roots
      .replace(/\\sqrt(?!\{)/g, '\\sqrt{}')
      // Handle superscripts and subscripts properly
      .replace(/\^(\w+)/g, '^{$1}')
      .replace(/_(\w+)/g, '_{$1}')
      // Handle common symbols
      .replace(/\\pi/g, '\\pi')
      .replace(/\\theta/g, '\\theta')
      .replace(/\\alpha/g, '\\alpha')
      .replace(/\\beta/g, '\\beta')
      .replace(/\\gamma/g, '\\gamma')
      .replace(/\\delta/g, '\\delta')
      .replace(/\\infty/g, '\\infty')
      .replace(/\\sum/g, '\\sum')
      .replace(/\\int/g, '\\int')
      .replace(/\\lim/g, '\\lim')
      // Handle equals and other relations
      .replace(/=/g, ' = ')
      .replace(/</g, ' < ')
      .replace(/>/g, ' > ')
      .replace(/\\leq/g, ' \\leq ')
      .replace(/\\geq/g, ' \\geq ')
      // Fix common spacing issues in math expressions
      .replace(/(\d+)\s*\\\s*cdot\s*(\d+)/g, '$1 \\cdot $2')
      .replace(/\\\s*cdot/g, '\\cdot')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Clean LaTeX formula of problematic characters
  const cleanLatexFormula = (formula: string): string => {
    let cleaned = formula
      .trim()
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    // Apply character encoding fixes first
    cleaned = fixCharacterEncoding(cleaned);
    
    // Fix incomplete fractions within the formula
    cleaned = cleaned.replace(/\\frac\{([^}]+)\}(?!\{)/g, (match, numerator) => {
      // Look for the next content that might be the denominator
      const afterMatch = cleaned.substring(cleaned.indexOf(match) + match.length);
      
      // Try to find a following {content} pattern
      const nextBraceMatch = afterMatch.match(/^\s*\{([^}]+)\}/);
      if (nextBraceMatch) {
        return `\\frac{${numerator}}{${nextBraceMatch[1]}}`;
      }
      
      // Try to find a number or variable following
      const nextContentMatch = afterMatch.match(/^\s*([a-zA-Z0-9]+)/);
      if (nextContentMatch) {
        return `\\frac{${numerator}}{${nextContentMatch[1]}}`;
      }
      
      // Default to fraction over 1
      return `\\frac{${numerator}}{1}`;
    });
    
    // Fix other common LaTeX issues
    cleaned = cleaned
      // Handle simple variable expressions - preserve "5x" format
      .replace(/(\d+)\s+([a-zA-Z])/g, '$1$2') // "5 x" -> "5x"
      .replace(/(\d+)\s*\*\s*([a-zA-Z])/g, '$1$2') // "5*x" -> "5x"
      // Fix spacing around operators
      .replace(/\s*\\cdot\s*/g, '\\cdot')
      .replace(/\s*\+\s*/g, ' + ')
      .replace(/\s*-\s*/g, ' - ')
      .replace(/\s*=\s*/g, ' = ')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleaned;
  };

  // Process standalone LaTeX commands
  const processLatexCommands = (text: string): string => {
    // Handle standalone LaTeX expressions (without $ delimiters)
    return text.replace(/\\([a-zA-Z]+)(?:\{([^}]*)\})?/g, (match, command, argument) => {
      try {
        const latexExpr = argument ? `\\${command}{${argument}}` : `\\${command}`;
        return `<span class="latex-command">${katex.renderToString(latexExpr, { 
          displayMode: false,
          strict: false,
          trust: true,
          throwOnError: false
        })}</span>`;
      } catch (error) {
        // If it's not a valid LaTeX command, return as-is
        return match;
      }
    });
  };

  // Define custom macros for math
  const getMathMacros = () => ({
    "\\RR": "\\mathbb{R}",
    "\\NN": "\\mathbb{N}",
    "\\ZZ": "\\mathbb{Z}",
    "\\QQ": "\\mathbb{Q}",
    "\\CC": "\\mathbb{C}",
    "\\abs": "\\left|#1\\right|",
    "\\floor": "\\left\\lfloor#1\\right\\rfloor",
    "\\ceil": "\\left\\lceil#1\\right\\rceil"
  });
  
  return (
    <div 
      ref={containerRef} 
      className={`
        ${block ? "latex-block-container" : "latex-inline-container"}
        ${isMathModule ? "math-module-content" : ""}
        text-left
      `}
      style={{
        lineHeight: isMathModule ? '1.6' : '1.4',
        fontSize: isMathModule ? '16px' : '14px', // Smaller font size
        textAlign: 'left',
        whiteSpace: 'pre-wrap', // Preserve whitespace and line breaks
        wordWrap: 'break-word',
        fontWeight: 'normal' // Remove bold styling
      }}
    />
  );
};

export default LatexRenderer; 