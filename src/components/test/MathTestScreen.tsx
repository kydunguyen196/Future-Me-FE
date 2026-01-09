import React, { useState, useEffect } from 'react';
import SatTestQuestion from './SatTestQuestion';
import MathTextQuestion from './MathTextQuestion';
import StudentResponseDirections from './StudentResponseDirections';
import TestQuestionLayout from './TestQuestionLayout';
import CheckYourWorkScreen from './CheckYourWorkScreen';
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

interface MathTestScreenProps {
  partNumber: number;
  questions: Question[];
  timeInMinutes: number;
  examId?: string;
  onComplete: (answers: Record<string, string>) => void;
  onReportError?: () => void;
}

/**
 * Reusable Math test screen component
 */
const MathTestScreen: React.FC<MathTestScreenProps> = ({
  partNumber,
  questions,
  timeInMinutes,
  examId,
  onComplete,
  onReportError,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(`${String(timeInMinutes).padStart(2, '0')}:00`);
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [seconds, setSeconds] = useState(timeInMinutes * 60);
  const [eliminationMode, setEliminationMode] = useState(false);
  const [showCheckYourWork, setShowCheckYourWork] = useState(false);
  
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
      // Show Check Your Work screen instead of immediately submitting
      setShowCheckYourWork(true);
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
    const questionIndex = questionNumber - 1;
    if (questionIndex >= 0 && questionIndex < questions.length) {
      setCurrentQuestionIndex(questionIndex);
      setShowCheckYourWork(false); // Hide check your work screen when navigating to a question
    }
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

  const handleCheckYourWorkNext = () => {
    onComplete(answers);
  };

  const handleShowCheckYourWork = () => {
    setShowCheckYourWork(true);
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  const questionNumber = currentQuestionIndex + 1;
  
  // Add guard to prevent undefined errors
  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Loading questions...</h2>
        </div>
      </div>
    );
  }

  // Show Check Your Work screen
  if (showCheckYourWork) {
    const questionsForReview = questions.map((q, index) => ({
      id: q.id,
      questionNumber: index + 1,
      module: `Math: Module ${partNumber}`
    }));

    return (
      <CheckYourWorkScreen
        moduleTitle={`Math: Module ${partNumber}`}
        questions={questionsForReview}
        answers={answers}
        markedQuestions={markedForReview}
        timeRemaining={timeRemaining}
        onNavigateToQuestion={handleNavigateToQuestion}
        onSubmit={handleSubmit}
        onNext={handleCheckYourWorkNext}
      />
    );
  }
  
  // Debug: Log current question details
  // console.log('MathTestScreen - Current question:', {
  //   id: currentQuestion?.id,
  //   text: currentQuestion?.text,
  //   type: currentQuestion?.type,
  //   questionNumber
  // });
  
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
            <LatexRenderer content={currentQuestion.text} block={true} isMathModule={true} />
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
        moduleTitle={`Math: Module ${partNumber}`}
        questionNumber={questionNumber}
        totalQuestions={questions.length}
        timeRemaining={timeRemaining}
        totalTimeInMinutes={timeInMinutes}
        currentTimeInSeconds={seconds}
        onNextQuestion={handleNextQuestion}
        onPreviousQuestion={handlePreviousQuestion}
        onSaveAndExit={handleSubmit}
        onMarkForReview={handleMarkForReview}
        isMarkedForReview={markedForReview[currentQuestion.id]}
        onReportError={onReportError}
        onShowCheckYourWork={handleShowCheckYourWork}
        examId={examId}
        questionId={currentQuestion.id}
        eliminationMode={eliminationMode}
        questionContent={
          <div className="test-question-column h-full">
            {currentQuestion.type === 'RADIO' ? (
              <div>
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">
                    Choose the best answer based on the problem:
                  </div>

                </div>
                <SatTestQuestion
                  question={{
                    questionText: "",
                    options: optionsWithLabels,
                    eliminationMode: eliminationMode
                  }}
                  selectedAnswer={answers[currentQuestion.id] || null}
                  onAnswerSelect={(optionId) => handleSelectOption(currentQuestion.id, optionId)}
                  isMathModule={true}
                />
              </div>
            ) : (
              <MathTextQuestion
                key={currentQuestion.id} // Force re-render when question changes
                questionText={currentQuestion.text} // Show the question text at the top of the answer input
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

export default MathTestScreen; 