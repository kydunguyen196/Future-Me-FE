import { useState } from 'react';
import LatexRenderer from './LatexRenderer';
import { Slash } from 'lucide-react';

interface Option {
  id: string;
  text: string;
  hasLatex?: boolean;
  label: string; // A, B, C, D, etc.
}

interface TestQuestion {
  questionText: string;
  options: Option[];
  eliminationMode?: boolean;
}

interface SatTestQuestionProps {
  question: TestQuestion;
  selectedAnswer: string | null;
  onAnswerSelect: (answerId: string) => void;
  isMathModule?: boolean;
}

/**
 * Component for displaying SAT test questions
 */
const SatTestQuestion: React.FC<SatTestQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  isMathModule = false,
}) => {
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, boolean>>({});

  const handleOptionClick = (optionId: string) => {
    if (question.eliminationMode) {
      // Toggle elimination status
      setEliminatedOptions(prev => ({
        ...prev,
        [optionId]: !prev[optionId]
      }));
    } else {
      // Regular selection - but only if option is not eliminated
      if (!eliminatedOptions[optionId]) {
        // Allow unselecting: if the same option is clicked again, deselect it
        if (selectedAnswer === optionId) {
          onAnswerSelect(''); // Deselect by passing empty string
        } else {
          onAnswerSelect(optionId); // Select the new option
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Question text */}
      <div className="text-lg">
        <p className="mb-6 font-medium text-lg">
          Which choice completes the text with the most logical and precise word or phrase?
        </p>
        <LatexRenderer content={question.questionText} block={true} isMathModule={isMathModule} />
      </div>
      
      {/* Options */}
      <div className="space-y-4">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option.id;
          const isEliminated = eliminatedOptions[option.id];
          const isClickable = question.eliminationMode || !isEliminated;
          
          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              disabled={!isClickable}
              className={`flex items-center w-full text-left rounded-full pl-3 pr-5 py-3 border-2 text-lg transition-all duration-200 ${
                isClickable ? 'hover:bg-gray-50 hover:shadow-sm' : 'cursor-not-allowed'
              } ${
                isSelected ? 'border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-200' : 'border-gray-300'
              } ${isEliminated ? 'border-red-300 bg-red-50' : ''}`}
            >
              <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full mr-4 relative text-lg font-medium ${
                isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100'
              } ${isEliminated ? 'bg-red-100' : ''}`}>
                {option.label}
                {isEliminated && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-0.5 w-8 bg-red-500 transform rotate-45"></div>
                  </div>
                )}
              </div>
              <div className={`flex-grow flex items-center justify-start text-lg min-h-[2.5rem] pl-2 ${isEliminated ? 'text-gray-400 line-through' : ''}`}>
                <LatexRenderer content={option.text} isMathModule={isMathModule} />
              </div>
              <div className={`flex-shrink-0 ml-3 rounded-full h-10 w-10 flex items-center justify-center relative text-lg font-medium ${
                isSelected ? 'bg-blue-600 text-white' : 'border border-gray-300'
              } ${isEliminated ? 'border-red-300 bg-red-50' : ''}`}>
                {option.label}
                {isEliminated && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-0.5 w-8 bg-red-500 transform rotate-45"></div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {question.eliminationMode && (
        <div className="mt-6 p-3 bg-blue-50 rounded-md text-base text-blue-700 flex items-center">
          <Slash size={18} className="mr-3" />
          <span>Elimination mode active. Click on answers to mark them as eliminated.</span>
        </div>
      )}
    </div>
  );
};

export default SatTestQuestion; 