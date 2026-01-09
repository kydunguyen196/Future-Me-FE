import { useState } from 'react';
import { Button } from '../ui/button';

interface Question {
  id: string;
  questionNumber: number;
  module: string;
}

interface CheckYourWorkScreenProps {
  moduleTitle: string;
  questions: Question[];
  answers: Record<string, string>;
  markedQuestions: Record<string, boolean>;
  timeRemaining?: string;
  onNavigateToQuestion: (questionNumber: number) => void;
  onSubmit: () => void;
  onNext: () => void;
}

interface SubmitModalProps {
  isOpen: boolean;
  unansweredCount: number;
  onSubmit: () => void;
  onCancel: () => void;
}

interface IncompleteModalProps {
  isOpen: boolean;
  unansweredCount: number;
  totalQuestions: number;
  onProceed: () => void;
  onCancel: () => void;
}

const SubmitModal: React.FC<SubmitModalProps> = ({ isOpen, unansweredCount, onSubmit, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Incomplete Test Section</h3>
        <p className="text-gray-700 mb-6">
          You have {unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''}. 
          Are you sure you want to submit this section?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSubmit} className="bg-blue-600 hover:bg-blue-700">
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

const IncompleteModal: React.FC<IncompleteModalProps> = ({ 
  isOpen, 
  unansweredCount, 
  totalQuestions, 
  onProceed, 
  onCancel 
}) => {
  if (!isOpen) return null;

  const answeredCount = totalQuestions - unansweredCount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Section Not Complete</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            You have only answered <strong>{answeredCount} out of {totalQuestions}</strong> questions in this section.
          </p>
          <p className="text-gray-700 mb-3">
            <strong>{unansweredCount} question{unansweredCount !== 1 ? 's remain' : ' remains'} unanswered.</strong>
          </p>
          <p className="text-gray-600 text-sm">
            We recommend reviewing and answering all questions before proceeding to the next section for the best practice experience.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel} className="px-4">
            Review Questions
          </Button>
          <Button 
            onClick={onProceed} 
            className="bg-orange-600 hover:bg-orange-700 text-white px-4"
          >
            Continue Anyway
          </Button>
        </div>
      </div>
    </div>
  );
};

const CheckYourWorkScreen: React.FC<CheckYourWorkScreenProps> = ({
  moduleTitle,
  questions,
  answers,
  markedQuestions,
  // @ts-ignore
  timeRemaining,
  onNavigateToQuestion,
  onSubmit,
  onNext,
}) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  // Calculate question statuses with correct priority: answered > marked > unanswered
  const getQuestionStatus = (question: Question) => {
    const isAnswered = answers[question.id] && answers[question.id].trim() !== '';
    const isMarked = markedQuestions[question.id];
    
    // Priority order: answered first, then marked, then unanswered
    if (isAnswered) return 'answered';
    if (isMarked) return 'marked';
    return 'unanswered';
  };

  const unansweredQuestions = questions.filter(q => !answers[q.id] || answers[q.id].trim() === '');
  const answeredQuestions = questions.filter(q => answers[q.id] && answers[q.id].trim() !== '');
  const markedQuestionsList = questions.filter(q => markedQuestions[q.id]);
  
  //@ts-ignore:onSubmit is not defined in the state
  const handleSubmitClick = () => {
    if (unansweredQuestions.length > 0) {
      setShowSubmitModal(true);
    } else {
      onSubmit();
    }
  };

  const handleConfirmSubmit = () => {
    setShowSubmitModal(false);
    onSubmit();
  };

  const handleCancelSubmit = () => {
    setShowSubmitModal(false);
  };

  const handleNextClick = () => {
    if (unansweredQuestions.length > 0) {
      setShowIncompleteModal(true);
    } else {
      onNext();
    }
  };

  const handleProceedAnyway = () => {
    setShowIncompleteModal(false);
    onNext();
  };

  const handleCancelNext = () => {
    setShowIncompleteModal(false);
  };

  const getStatusButtonClass = (status: string) => {
    switch (status) {
      case 'answered':
        return 'bg-green-500 border-2 border-green-500 text-white hover:bg-green-600 hover:border-green-600 hover:shadow-md';
      case 'marked':
        return 'bg-orange-500 border-2 border-orange-500 text-white hover:bg-orange-600 hover:border-orange-600 hover:shadow-md';
      case 'unanswered':
        return 'bg-white border-2 border-dashed border-gray-400 text-gray-600 hover:bg-gray-50 hover:border-gray-500 hover:text-gray-700';
      default:
        return 'bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-5xl w-full">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h2 className="text-5xl font-light text-gray-900 mb-6">Check Your Work</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-gray-600 mb-3 leading-relaxed">
                On test day, you won't be able to move on to the next module until time expires.
              </p>
              <p className="text-xl text-gray-600 leading-relaxed">
                For these practice tests, you can click <span className="font-semibold text-gray-900">Next</span> when you're ready to move on.
              </p>
            </div>
          </div>

          {/* Question Grid Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-10 mb-10">
            {/* Module Title and Legend */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">{moduleTitle}</h3>
              <div className="flex items-center justify-center gap-8 text-base">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 border-2 border-green-500 rounded-md shadow-sm"></div>
                  <span className="font-medium text-gray-700">Answered</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-orange-500 border-2 border-orange-500 rounded-md shadow-sm"></div>
                  <span className="font-medium text-gray-700">For Review</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-white border-2 border-dashed border-gray-400 rounded-md"></div>
                  <span className="font-medium text-gray-700">Unanswered</span>
                </div>
              </div>
            </div>

            {/* Question Numbers Grid */}
            <div className="grid grid-cols-10 gap-4 mb-10">
              {questions.map((question) => {
                const status = getQuestionStatus(question);
                return (
                  <button
                    key={question.id}
                    onClick={() => onNavigateToQuestion(question.questionNumber)}
                    className={`w-14 h-14 rounded-lg text-base font-bold transition-all duration-200 transform hover:scale-105 shadow-sm ${getStatusButtonClass(status)}`}
                  >
                    {question.questionNumber}
                  </button>
                );
              })}
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{answeredQuestions.length}</div>
                <div className="text-lg text-gray-600 font-medium">Answered</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">{markedQuestionsList.length}</div>
                <div className="text-lg text-gray-600 font-medium">For Review</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-500 mb-2">{unansweredQuestions.length}</div>
                <div className="text-lg text-gray-600 font-medium">Unanswered</div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center">
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => onNavigateToQuestion(questions.length)}
                className="px-8 py-3 text-base font-medium border-2 hover:bg-gray-50"
              >
                ← Back to Questions
              </Button>
              <Button 
                onClick={handleNextClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-medium shadow-lg"
              >
                Continue to Next Section →
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      <SubmitModal
        isOpen={showSubmitModal}
        unansweredCount={unansweredQuestions.length}
        onSubmit={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
      />

      {/* Incomplete Section Modal */}
      <IncompleteModal
        isOpen={showIncompleteModal}
        unansweredCount={unansweredQuestions.length}
        totalQuestions={questions.length}
        onProceed={handleProceedAnyway}
        onCancel={handleCancelNext}
      />
    </div>
  );
};

export default CheckYourWorkScreen; 