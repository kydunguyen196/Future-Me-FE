import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Button } from '../ui/button';
import { ChevronDown, BookmarkIcon, AlertCircle, ChevronRight, ChevronLeft,  X, Calculator, BookOpen } from 'lucide-react';
import { Modal } from '../ui/modal';
import { Popover } from '../ui/popover';
import LatexRenderer from './LatexRenderer';
import api from '@/lib/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface TestQuestionLayoutProps {
  moduleTitle: string;
  questionNumber: number;
  totalQuestions: number;
  timeRemaining: string;
  totalTimeInMinutes?: number;
  currentTimeInSeconds?: number;
  onNextQuestion: () => void;
  onPreviousQuestion?: () => void;
  onSaveAndExit: () => void;
  testTitle?: string;
  onMarkForReview?: () => void;
  isMarkedForReview?: boolean;
  questionContent: ReactNode;
  passageContent: ReactNode;
  children?: ReactNode;
  onToggleEliminationMode?: (isActive: boolean) => void;
  onNavigateToQuestion?: (questionNumber: number) => void;
  markedQuestions?: Record<string, boolean>;
  answeredQuestions?: Record<string, boolean>;
  onReportError?: () => void;
  onShowCheckYourWork?: () => void;
  examId?: string;
  questionId?: string;
  eliminationMode?: boolean;
}

const TestQuestionLayout: React.FC<TestQuestionLayoutProps> = ({
  moduleTitle,
  questionNumber,
  totalQuestions,
  timeRemaining,
  totalTimeInMinutes = 32,
  currentTimeInSeconds,
  onNextQuestion,
  onPreviousQuestion,
  // onSaveAndExit,
  onMarkForReview,
  isMarkedForReview = false,
  questionContent,
  passageContent,
  onToggleEliminationMode,
  onNavigateToQuestion,
  markedQuestions = {},
  answeredQuestions = {},
  onReportError,
  onShowCheckYourWork,
  examId,
  questionId,
  eliminationMode: parentEliminationMode = false
}) => {
  const navigate = useNavigate();
  const [directionsModalOpen, setDirectionsModalOpen] = useState(false);
  const [questionNavigationOpen, setQuestionNavigationOpen] = useState(false);
  const [hideContent, setHideContent] = useState(false);
  const [eliminationMode, setEliminationMode] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [reportErrorModalOpen, setReportErrorModalOpen] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Sync local elimination mode state with parent's state
  useEffect(() => {
    setEliminationMode(parentEliminationMode);
  }, [parentEliminationMode]);

  // Handle exit button click
  const handleExitClick = () => {
    setExitModalOpen(true);
  };

  // Handle exit confirmation
  const handleConfirmExit = async () => {
    if (!examId) {
      // If no examId, just navigate back
      navigate('/tests');
      return;
    }

    try {
      setIsExiting(true);
      console.log('Ending exam:', examId);
      
      // Send POST request to end the exam
      const response = await api.post(`/sat/exam/${examId}/end`);
      
      if (response.data.result === 'OK' || response.status === 200) {
        console.log('Exam ended successfully');
        toast.success('Exam ended successfully');
        
        // Navigate to results page
        navigate(`/test-results/${examId}`, { replace: true });
      } else {
        console.warn('Exam end API returned non-OK result:', response.data);
        toast.warning('Exam ended, but there might be an issue with saving. Redirecting to results...');
        navigate(`/test-results/${examId}`, { replace: true });
      }
    } catch (error: any) {
      console.error('Failed to end exam:', error);
      
      if (error.response?.status === 404) {
        console.warn('Exam end endpoint not found, proceeding to results anyway');
        toast.warning('Exam ended, redirecting to results...');
        navigate(`/test-results/${examId}`, { replace: true });
      } else {
        toast.error('Failed to end exam properly. You may try again later.');
        // Still navigate to results even if API call fails
        navigate(`/test-results/${examId}`, { replace: true });
      }
    } finally {
      setIsExiting(false);
      setExitModalOpen(false);
    }
  };

  // Handle exit cancellation
  const handleCancelExit = () => {
    setExitModalOpen(false);
  };

  // Determine timer color and animation based on time remaining
  const getTimerClasses = () => {
    if (!currentTimeInSeconds) {
      return "text-gray-900"; // Default styling
    }

    const totalSeconds = totalTimeInMinutes * 60;
    const timePercentage = currentTimeInSeconds / totalSeconds;

    if (timePercentage > 2/3) {
      return "text-gray-900"; // First 1/3 of time (normal)
    } else if (timePercentage > 1/3) {
      return "text-yellow-700 timer-pulse"; // Second 1/3 of time (yellow with subtle pulse)
    } else {
      return "text-red-700 timer-blink"; // Final 1/3 of time (red with more urgent pulse)
    }
  };

  // Toggle elimination mode
  const toggleEliminationMode = () => {
    const newMode = !eliminationMode;
    setEliminationMode(newMode);
    if (onToggleEliminationMode) {
      onToggleEliminationMode(newMode);
    }
  };

  // Open directions modal
  const openDirectionsModal = () => {
    setDirectionsModalOpen(true);
  };

  // Close directions modal
  const closeDirectionsModal = () => {
    setDirectionsModalOpen(false);
  };

  // Handle navigating to a specific question
  const handleNavigateToQuestion = (qNumber: number) => {
    if (onNavigateToQuestion) {
      onNavigateToQuestion(qNumber);
      setQuestionNavigationOpen(false);
    }
  };

  // Generate an array of question numbers for the navigation grid
  const generateQuestionNumbers = () => {
    const numbers = [];
    for (let i = 1; i <= totalQuestions; i++) {
      numbers.push(i);
    }
    return numbers;
  };

  // Show all questions since tabs are disabled
  const getFilteredQuestions = () => {
    return generateQuestionNumbers();
  };

  // Open calculator in new window
  const openCalculator = () => {
    window.open(
      'https://www.desmos.com/calculator', 
      'desmosCalculator', 
      'width=800,height=600,resizable=yes,scrollbars=yes,status=yes'
    );
  };

  // Handle report error
  const handleReportError = () => {
    if (onReportError) {
      onReportError();
    } else {
      // Show report error modal
      setReportErrorModalOpen(true);
    }
  };

  // Handle report error modal submission
  const handleSubmitReport = async () => {
    if (!reportDescription.trim()) {
      toast.error('Please enter a description of the error.');
      return;
    }

    try {
      setIsSubmittingReport(true);
      
      const reportData = {
        title: `Question with ID ${questionId || `Question ${questionNumber}`} has an error`,
        category: `SAT_${questionId}`,
        description: reportDescription.trim(),
        attachments: []
      };

      console.log('Submitting error report:', reportData);
      
      const response = await api.post('/id/ticket', reportData);
      
      if (response.status === 200 || response.status === 201 || response.data.result === 'OK') {
        console.log('Error report submitted successfully');
        toast.success('Thank you for reporting this error. We will review it shortly.');
        setReportErrorModalOpen(false);
        setReportDescription('');
      } else {
        console.warn('Report submission returned non-OK result:', response.data);
        toast.warning('Report submitted, but there might be an issue. We will still review it.');
        setReportErrorModalOpen(false);
        setReportDescription('');
      }
    } catch (error: any) {
      console.error('Failed to submit error report:', error);
      
      if (error.response?.status === 404) {
        console.warn('Report endpoint not found');
        toast.warning('Report system temporarily unavailable. Please try again later.');
      } else {
        toast.error('Failed to submit error report. Please try again.');
      }
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Handle report error modal cancellation
  const handleCancelReport = () => {
    setReportErrorModalOpen(false);
    setReportDescription('');
  };

  // Open reference in new window
  const openReference = () => {
    window.open(
      '/test/reference', 
      'formulaReference', 
      'width=900,height=800,resizable=yes,scrollbars=yes,status=yes'
    );
  };

  // Determine if this is a math module based on title
  const isMathModule = moduleTitle.toLowerCase().includes('math');

  // Question Navigation Content component
  const QuestionNavigationContent = () => (
    <div className="bg-white rounded-lg shadow-lg w-[650px]">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b">
        <h3 className="text-xl font-semibold">{moduleTitle}</h3>
        <button 
          className="text-gray-400 hover:text-gray-500"
          onClick={() => setQuestionNavigationOpen(false)}
        >
          <X size={24} />
        </button>
      </div>

      {/* Filter tabs - Disabled, for visual reference only */}
      <div className="flex border-b">
        <div className="flex-1 py-4 text-base font-medium text-gray-600 bg-gray-50 border-b-2 border-gray-300 cursor-default">
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-dashed border-gray-400 rounded"></div>
            <span>Unanswered</span>
          </div>
        </div>
        <div className="flex-1 py-4 text-base font-medium text-green-600 bg-green-50 border-b-2 border-green-300 cursor-default">
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Answered</span>
          </div>
        </div>
        <div className="flex-1 py-4 text-base font-medium text-orange-600 bg-orange-50 border-b-2 border-orange-300 cursor-default">
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>For Review</span>
          </div>
        </div>
      </div>

      {/* Question grid */}
      <div className="p-6">
        <div className="grid grid-cols-8 gap-3">
          {getFilteredQuestions().map((num) => {
            const isCurrentQuestion = num === questionNumber;
            const isAnswered = answeredQuestions[`q${num}`];
            const isMarked = markedQuestions[`q${num}`];
            
            // Priority order: Answered > For Review > Unanswered
            let buttonClass = '';
            if (isCurrentQuestion) {
              buttonClass = 'bg-blue-600 border-2 border-blue-600 text-white shadow-lg ring-2 ring-blue-200 hover:bg-blue-700 hover:border-blue-700 hover:shadow-xl transform hover:scale-105';
            } else if (isAnswered) {
              // Answered has highest priority - always green regardless of review status
              buttonClass = 'bg-green-500 border-2 border-green-500 text-white hover:bg-green-600 hover:border-green-600 hover:shadow-md hover:scale-105';
            } else if (isMarked) {
              // For Review has second priority - orange when not answered
              buttonClass = 'bg-orange-500 border-2 border-orange-500 text-white hover:bg-orange-600 hover:border-orange-600 hover:shadow-md hover:scale-105';
            } else {
              // Unanswered has lowest priority - dashed border
              buttonClass = 'bg-white border-2 border-dashed border-gray-400 text-gray-600 hover:bg-gray-50 hover:border-gray-500 hover:text-gray-700 hover:border-solid hover:shadow-sm';
            }
            
            return (
              <button
                key={num}
                className={`h-11 w-11 flex items-center justify-center rounded-lg text-base font-semibold transition-all duration-200 ${buttonClass}`}
                onClick={() => handleNavigateToQuestion(num)}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 flex justify-center">
        <Button 
          variant="outline" 
          className="rounded-full px-8 py-3 text-base font-medium"
          onClick={handleShowCheckYourWork}
        >
          Go to Check Your Work
        </Button>
      </div>
    </div>
  );

  // Handle showing Check Your Work screen
  const handleShowCheckYourWork = () => {
    if (onShowCheckYourWork) {
      onShowCheckYourWork();
      setQuestionNavigationOpen(false);
    } else {
      // Fallback - just close the popover if the function is not provided
      setQuestionNavigationOpen(false);
    }
  };

  return (
    <div className="min-h-screen w-full m-0 p-0 bg-white flex flex-col">
      {/* Top header bar - Fixed */}
      <div className="border-b py-3 px-6 bg-white shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between w-full">
          {/* Left section - Module title and directions */}
          <div className="flex flex-col w-1/3">
            <div className="font-semibold text-lg text-gray-900 mb-1 text-left ps-2">{moduleTitle}</div>
            <button 
              className="text-sm text-gray-600 flex items-center border-none outline-none focus:outline-none hover:text-gray-800 self-start text-left"
              onClick={openDirectionsModal}
              style={{border: "none", outline: "none"}}
            >
              Directions <ChevronDown size={16} className="ml-1" />
            </button>
          </div>
          
          {/* Center section - Timer */}
          <div className="flex justify-center w-1/3">
            <div className={`text-2xl font-mono font-bold tracking-wider px-4 py-2 rounded-lg transition-all duration-300 ${getTimerClasses()}`}>
              {timeRemaining}
            </div>
          </div>
          
          {/* Right section - Action buttons */}
          <div className="flex gap-2 w-1/3 justify-end">
            {isMathModule && (
              <>
                <Button 
                  variant="outline" 
                  className="rounded-full flex items-center gap-1 text-sm"
                  onClick={openCalculator}
                >
                  <Calculator size={16} />
                  <span className="hidden sm:inline">Calculator</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="rounded-full flex items-center gap-1 text-sm"
                  onClick={openReference}
                >
                  <BookOpen size={16} />
                  <span className="hidden sm:inline">Reference</span>
                </Button>
              </>
            )}
            
            <Button 
              variant="outline" 
              className="rounded-full text-sm"
              onClick={handleExitClick}
            >
              Exit
            </Button>
          </div>
        </div>
      </div>
      
      {/* Directions modal */}
      <Modal
        isOpen={directionsModalOpen}
        onClose={closeDirectionsModal}
        maxWidth="max-w-3xl"
        footer={
          <Button 
            variant="outline" 
            className="rounded-full px-6"
            onClick={closeDirectionsModal}
          >
            Close
          </Button>
        }
      >
        <div className="space-y-6 py-2 max-w-3xl mx-auto">
          <div className="prose prose-slate max-w-none">
            {isMathModule ? (
              <>
                <p className="text-base leading-relaxed">
                  This section tests your mathematical reasoning. You'll solve problems related to algebra, advanced math, problem-solving,
                  and data analysis. Each question has a single correct answer.
                </p>
                
                <p className="text-base leading-relaxed mt-4">
                  For some questions, you will need to enter your answer as a number or fraction rather than select from options.
                </p>
                
                <div className="mt-6 mb-2">
                  <h3 className="text-center text-lg font-semibold">Examples</h3>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-center">Answer</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Acceptable ways to enter answer</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Unacceptable: will NOT receive credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                          <LatexRenderer content="3.5" />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <div><LatexRenderer content="3.5" /></div>
                          <div><LatexRenderer content="3.50" /></div>
                          <div><LatexRenderer content="\frac{7}{2}" /></div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center text-red-600">
                          <div><LatexRenderer content="31/2" /></div>
                          <div><LatexRenderer content="3\ 1/2" /></div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                          <LatexRenderer content="\frac{2}{3}" />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <div><LatexRenderer content="2/3" /></div>
                          <div><LatexRenderer content=".6666" /></div>
                          <div><LatexRenderer content=".6667" /></div>
                          <div><LatexRenderer content="0.666" /></div>
                          <div><LatexRenderer content="0.667" /></div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center text-red-600">
                          <div><LatexRenderer content="0.66" /></div>
                          <div><LatexRenderer content=".66" /></div>
                          <div><LatexRenderer content="0.67" /></div>
                          <div><LatexRenderer content=".67" /></div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                          <LatexRenderer content="-\frac{1}{3}" />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <div><LatexRenderer content="-1/3" /></div>
                          <div><LatexRenderer content="-.3333" /></div>
                          <div><LatexRenderer content="-0.333" /></div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center text-red-600">
                          <div><LatexRenderer content="-.33" /></div>
                          <div><LatexRenderer content="-0.33" /></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <p className="text-base leading-relaxed">
                  The questions in this section address a number of important reading and writing skills. Each question includes one or more passages, 
                  which may include a table or graph. Read each passage and question carefully, and then choose the best answer to the question based on 
                  the passage(s).
                </p>
                
                <p className="text-base leading-relaxed mt-6">
                  All questions in this section are multiple-choice with four answer choices. Each question has a single best answer.
                </p>
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* Exit confirmation modal */}
      <Modal
        isOpen={exitModalOpen}
        onClose={handleCancelExit}
        maxWidth="max-w-md"
        title="Exit Test"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to exit the test? Your current progress will be saved and submitted.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={handleCancelExit}
              disabled={isExiting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmExit}
              disabled={isExiting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isExiting ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Exiting...
                </>
              ) : (
                'Exit Test'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Report Error modal */}
      <Modal
        isOpen={reportErrorModalOpen}
        onClose={handleCancelReport}
        maxWidth="max-w-md"
        title="Report Error"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Please describe the error you encountered with this question. Your feedback helps us improve the test experience.
          </p>
          <div className="space-y-2">
            <label htmlFor="error-description" className="block text-sm font-medium text-gray-700">
              Error Description *
            </label>
            <textarea
              id="error-description"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Please describe the error you found..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              disabled={isSubmittingReport}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={handleCancelReport}
              disabled={isSubmittingReport}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReport}
              disabled={isSubmittingReport || !reportDescription.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmittingReport ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Main content area - Scrollable */}
      <div className="flex-1 flex min-h-0">
        {/* Left column - passage content */}
        <div className={`w-1/2 border-r ${hideContent ? 'opacity-0' : ''} overflow-y-auto`}>
          <div className="p-6">
            {passageContent}
          </div>
        </div>
        
        {/* Right column - question and options */}
        <div className="w-1/2 flex flex-col min-h-0">
          {/* Question header - Fixed */}
          <div className="flex items-center justify-between p-4 bg-gray-100 border-b flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-black text-white rounded-full h-10 w-12 flex items-center justify-center font-semibold">
                {questionNumber}
              </div>
              <button 
                className={`flex items-center transition-colors duration-200 ${isMarkedForReview ? 'text-orange-600 hover:text-orange-700' : 'text-gray-600 hover:text-gray-700'}`}
                onClick={onMarkForReview}
              >
                <BookmarkIcon size={18} className="mr-1" />
                Mark for Review
              </button>
            </div>
            <Button 
              variant="outline" 
              className={`rounded-full border ${eliminationMode ? 'bg-blue-50 border-blue-600 text-blue-600' : 'border-gray-300'}`}
              onClick={toggleEliminationMode}
            >
              ABC
            </Button>
          </div>
          
          {/* Question content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {hideContent ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="text-xl font-medium mb-2">Content hidden</div>
                  <Button onClick={() => setHideContent(false)}>Show</Button>
                </div>
              ) : (
                questionContent
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom navigation bar - Fixed */}
      <div className="border-t py-3 px-6 flex justify-between items-center bg-white flex-shrink-0">
        <div className="flex items-center">
          <button 
            className="text-gray-400 flex items-center text-sm hover:text-gray-600 transition-colors"
            onClick={handleReportError}
          >
            <AlertCircle size={16} className="mr-1" />
            Report Error
          </button>
        </div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
          <Popover
            trigger={
              <button className="flex items-center border rounded-full px-4 py-1 bg-gray-100 hover:bg-gray-200 transition-colors">
                <span className="text-sm">
                  Question {questionNumber} of {totalQuestions}
                </span>
                <ChevronDown size={16} className="ml-1" />
              </button>
            }
            content={<QuestionNavigationContent />}
            open={questionNavigationOpen}
            onOpenChange={setQuestionNavigationOpen}
            placement="top"
            width="auto"
            className="origin-bottom"
          />
        </div>
        
        <div className="flex gap-2">
          {/* Previous button - only show from question 2 onwards */}
          {questionNumber > 1 && onPreviousQuestion && (
            <Button 
              variant="outline"
              className="rounded-full px-6 flex items-center"
              onClick={onPreviousQuestion}
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </Button>
          )}
          
          {/* Next button */}
          <Button 
            className="rounded-full px-6 flex items-center"
            onClick={onNextQuestion}
          >
            Next <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestQuestionLayout; 