import { useState, useEffect } from 'react';
import LatexRenderer from './LatexRenderer';
import { Input } from '../ui/input';

interface MathTextQuestionProps {
  questionText: string;
  selectedAnswer: string | null;
  onAnswerChange: (answer: string) => void;
  isDisabled?: boolean;
}

/**
 * Component for displaying Math text input questions (student-produced response)
 */
const MathTextQuestion: React.FC<MathTextQuestionProps> = ({
  questionText,
  selectedAnswer,
  onAnswerChange,
  isDisabled = false,
}) => {
  const [inputValue, setInputValue] = useState(selectedAnswer || '');
  const [validationMessage, setValidationMessage] = useState('');
  const [isValid, setIsValid] = useState(true);

  // Debug: Log when component mounts/remounts
  useEffect(() => {
    console.log('MathTextQuestion mounted with:', {
      initialSelectedAnswer: selectedAnswer,
      questionText: questionText.substring(0, 50) + '...'
    });
  }, []); // Empty dependency array means this runs only on mount

  // Sync inputValue with selectedAnswer when it changes (when navigating between questions)
  useEffect(() => {
    console.log('MathTextQuestion useEffect - selectedAnswer changed:', {
      selectedAnswer,
      currentInputValue: inputValue,
      questionText: questionText.substring(0, 50) + '...' // Log first 50 chars of question
    });
    setInputValue(selectedAnswer || '');
  }, [selectedAnswer]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const validation = validateInput(value);
    
    setInputValue(value);
    setValidationMessage(validation.message);
    setIsValid(validation.isValid);
    
    // Always save the input value, regardless of validation status
    // This ensures user input is preserved when navigating between questions
    onAnswerChange(value);
  };

  // Also save on blur to ensure values are captured
  const handleBlur = () => {
    onAnswerChange(inputValue);
  };

  const validateInput = (value: string): { isValid: boolean; message: string } => {
    if (!value) return { isValid: true, message: '' };

    // Check for invalid characters - be more strict, only allow numbers, decimal point, negative sign, and fraction slash
    if (/[^0-9.\-\/]/.test(value)) {
      return { isValid: false, message: "Only numbers, decimal points, negative signs, and fractions (/) are allowed." };
    }

    // Check for invalid characters (old rules maintained)
    if (/[%,$]/.test(value)) {
      return { isValid: false, message: "Don't enter symbols such as percent sign, comma, or dollar sign." };
    }

    // Check character limits
    const isNegative = value.startsWith('-');
    const maxLength = isNegative ? 6 : 5;
    
    if (value.length > maxLength) {
      return { 
        isValid: false, 
        message: `Maximum ${maxLength} characters ${isNegative ? '(including negative sign)' : 'for positive answers'}.` 
      };
    }

    // More strict validation - only allow:
    // - Integers: 123, -456
    // - Decimals: 12.34, -5.67, .5, -.25
    // - Simple fractions: 1/2, -3/4
    if (!/^-?(\d+|\d*\.\d+|\d+\.\d*|\d+\/\d+)$/.test(value)) {
      return { isValid: false, message: 'Enter a valid number, decimal, or simple fraction (e.g., 123, 12.5, 1/2).' };
    }

    // Additional validation for fractions
    if (value.includes('/')) {
      const parts = value.replace('-', '').split('/');
      if (parts.length !== 2 || parts[1] === '0') {
        return { isValid: false, message: 'Invalid fraction. Denominator cannot be zero.' };
      }
    }

    // Check for multiple decimal points
    if ((value.match(/\./g) || []).length > 1) {
      return { isValid: false, message: 'Only one decimal point allowed.' };
    }

    // Check for multiple negative signs or negative sign not at start
    if (value.includes('-') && (!value.startsWith('-') || (value.match(/-/g) || []).length > 1)) {
      return { isValid: false, message: 'Negative sign must be at the beginning and used only once.' };
    }

    return { isValid: true, message: '' };
  };

  // Filter input to only allow valid characters as user types
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];
    
    const allowedChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-', '/'];
    
    // Allow special keys
    if (allowedKeys.includes(event.key)) {
      return;
    }
    
    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
      return;
    }
    
    // Only allow specific characters
    if (!allowedChars.includes(event.key)) {
      event.preventDefault();
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Question Text - show at top with left alignment */}
        {questionText && questionText.trim() && (
          <div className="mb-8 text-left">
            <LatexRenderer content={questionText} block={true} isMathModule={true} />
          </div>
        )}
        
        {/* Answer Input Section - positioned at top with proper spacing */}
        <div className="space-y-6">
          <div className="text-left">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Enter your answer:</h3>
          </div>
          
          <div className="max-w-lg">
            <Input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              disabled={isDisabled}
              placeholder=""
              className={`w-full h-16 text-center text-2xl font-mono border-2 ${
                !isValid ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
              }`}
              autoComplete="off"
              maxLength={6}
            />
          </div>
          
          {/* Validation Message - left aligned */}
          {validationMessage && (
            <div className={`text-left text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
              {validationMessage}
            </div>
          )}
          
          {/* Answer Preview - left aligned */}
          <div className="text-left max-w-lg">
            <div className="text-sm text-gray-600 font-medium mb-2">Answer Preview:</div>
            <div className="p-4 bg-gray-50 border rounded-lg min-h-[60px] flex items-center justify-center text-xl">
              {inputValue ? (
                <span className="font-mono text-gray-900">{inputValue}</span>
              ) : (
                <span className="text-gray-400 italic">Your answer will appear here</span>
              )}
            </div>
          </div>

          {/* Input Rules - helpful for users */}
          <div className="text-left max-w-lg">
            <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="font-medium mb-1">Input Rules:</div>
              <ul className="space-y-1">
                <li>• Only numbers, decimals, and fractions allowed</li>
                <li>• Maximum {inputValue.startsWith('-') ? '6' : '5'} characters</li>
                <li>• Use negative sign (-) only at the beginning</li>
                <li>• No letters, commas, percent signs, or dollar signs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathTextQuestion; 