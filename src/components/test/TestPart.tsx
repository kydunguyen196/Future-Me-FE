import { useState, useEffect } from 'react';
import SatTestQuestion from './SatTestQuestion';
import MathTextQuestion from './MathTextQuestion';
import StudentResponseDirections from './StudentResponseDirections';
import TestQuestionLayout from './TestQuestionLayout';
import LatexRenderer from './LatexRenderer';

interface Question {
  id: string;
  text: string;
  type: 'RADIO' | 'TEXT';
  image?: string;
  options: Array<{
    id: string;
    text: string;
    hasLatex?: boolean;
    label?: string;
  }>;
  hasLatex?: boolean;
}

interface TestPartProps {
  partNumber: number;
  moduleName: string;
  questions: Question[];
  timeInMinutes: number;
  examId?: string;
  onComplete: (answers: Record<string, string>) => void;
}

/**
 * Component that displays a test part with questions and timer
 */
const TestPart: React.FC<TestPartProps> = ({
  partNumber,
  moduleName,
  questions,
  timeInMinutes,
  examId,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(`${String(timeInMinutes).padStart(2, '0')}:00`);
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [seconds, setSeconds] = useState(timeInMinutes * 60);
  const [eliminationMode, setEliminationMode] = useState(false);
  
  // Initialize the timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          onComplete(answers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeInMinutes, onComplete, answers]);
  
  // Format time string from seconds
  useEffect(() => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    setTimeRemaining(`${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
  }, [seconds]);

  // Add body class for test mode
  useEffect(() => {
    document.body.classList.add('test-active');
    return () => {
      document.body.classList.remove('test-active');
    };
  }, []);

  // Reset elimination mode when moving to a new question
  useEffect(() => {
    setEliminationMode(false);
  }, [currentQuestionIndex]);
  
  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  // Handle text input answers for TEXT type questions
  const handleTextAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Navigate to a specific question by number
  const handleNavigateToQuestion = (questionNumber: number) => {
    // Question numbers are 1-indexed, but array is 0-indexed
    setCurrentQuestionIndex(questionNumber - 1);
  };
  
  const handleSubmit = () => {
    onComplete(answers);
  };

  const handleMarkForReview = () => {
    const questionId = currentQuestion.id;
    setMarkedForReview(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleToggleEliminationMode = (isActive: boolean) => {
    setEliminationMode(isActive);
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  const questionNumber = currentQuestionIndex + 1;
  const isMathModule = moduleName.toLowerCase().includes('math');
  
  // Prepare data for the question navigation
  const answeredQuestions = questions.reduce((acc, question, index) => {
    const questionNumber = index + 1; // Question numbers are 1-indexed
    const isAnswered = !!(answers[question.id] && answers[question.id].trim() !== '');
    acc[`q${questionNumber}`] = isAnswered;
    return acc;
  }, {} as Record<string, boolean>);

  // Transform markedForReview to use question numbers instead of question IDs
  const markedQuestionsForNavigation = questions.reduce((acc, question, index) => {
    const questionNumber = index + 1; // Question numbers are 1-indexed
    const isMarked = !!markedForReview[question.id];
    acc[`q${questionNumber}`] = isMarked;
    return acc;
  }, {} as Record<string, boolean>);

  // Add labels (A, B, C, D) to options
  const optionsWithLabels = currentQuestion.options.map((option, index) => ({
    ...option,
    label: String.fromCharCode(65 + index) // A, B, C, D, etc.
  }));
  
  // Create passage content based on question type and actual question text
  const passageComponent = (
    <div className="test-passage-column h-full">
      <div className="prose prose-lg max-w-none">
        {currentQuestion.type === 'TEXT' ? (
          <div>
            {/* Show question image if available for TEXT questions */}
            {currentQuestion.image && (
              <div className="mb-6">
                <img 
                  src={currentQuestion.image} 
                  alt="Question illustration" 
                  className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            )}
            
            {/* Show student response directions */}
            <StudentResponseDirections />
          </div>
        ) : (
          <div>
            <LatexRenderer content={currentQuestion.text} block={true} isMathModule={isMathModule} />
            {currentQuestion.image && (
              <div className="mt-6">
                <img 
                  src={currentQuestion.image} 
                  alt="Question illustration" 
                  className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="test-flex-container">
      <TestQuestionLayout
        moduleTitle={`${moduleName}: Module ${partNumber}`}
        questionNumber={questionNumber}
        totalQuestions={questions.length}
        timeRemaining={timeRemaining}
        totalTimeInMinutes={timeInMinutes}
        currentTimeInSeconds={seconds}
        testTitle={examId ? `DSAT Test-${examId}` : "DSAT Practice Test 1"}
        onNextQuestion={handleNextQuestion}
        onPreviousQuestion={handlePreviousQuestion}
        onSaveAndExit={handleSubmit}
        onMarkForReview={handleMarkForReview}
        isMarkedForReview={markedForReview[currentQuestion.id]}
        eliminationMode={eliminationMode}
        questionContent={
          <div className="test-question-column h-full">
            {currentQuestion.type === 'RADIO' ? (
              <SatTestQuestion
                question={{
                  questionText: "",
                  options: optionsWithLabels,
                  eliminationMode: eliminationMode
                }}
                selectedAnswer={answers[currentQuestion.id] || null}
                onAnswerSelect={(optionId) => handleSelectOption(currentQuestion.id, optionId)}
                isMathModule={isMathModule}
              />
            ) : (
              <MathTextQuestion
                key={currentQuestion.id} // Force re-render when question changes
                questionText={currentQuestion.text}
                selectedAnswer={answers[currentQuestion.id] || null}
                onAnswerChange={(answer) => handleTextAnswerChange(currentQuestion.id, answer)}
              />
            )}
          </div>
        }
        passageContent={passageComponent}
        onToggleEliminationMode={handleToggleEliminationMode}
        onNavigateToQuestion={handleNavigateToQuestion}
        markedQuestions={markedQuestionsForNavigation}
        answeredQuestions={answeredQuestions}
      />
    </div>
  );
};

export default TestPart; 