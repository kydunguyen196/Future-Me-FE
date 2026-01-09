import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ReadingWritingTestScreen from '../../../components/test/ReadingWritingTestScreen';
import MathTestScreen from '../../../components/test/MathTestScreen';
import BreakTimer from '../../../components/test/BreakTimer';
import PendingScreen from '../../../components/test/PendingScreen';
import { Button } from '../../../components/ui/button';
import api from '@/lib/axios';
import '../../components/test/test.css';

// Global tracking for API calls to prevent duplicates across all instances
const API_CALL_TRACKER = new Map<string, Promise<any>>();

// Test state enum
enum TestState {
  LOADING = 'loading',
  START = 'start',
  PENDING = 'pending',
  BREAK = 'break',
  TEST_IN_PROGRESS = 'test_in_progress',
  TEST_COMPLETED = 'test_completed',
  ERROR = 'error'
}

// API Types
interface ExamAnswer {
  answerId: string;
  value: string;
  image?: string;
  correctAnswer: boolean;
}

interface ExamQuestion {
  questionId: string;
  level: string;
  type: 'RADIO' | 'TEXT';
  questionTitle: string;
  questionImage?: string;
  questionDomain: string;
  questionModule: 'Reading & Writing' | 'Math';
  answers: ExamAnswer[];
}

interface ExamData {
  examId: string;
  progress: 'Phase_1' | 'Phase_2' | 'Break_Time' | 'Phase_3' | 'Phase_4';
  questions: ExamQuestion[];
}

interface ApiResponse {
  result: string;
  correlationId: string;
  data: ExamData;
}

interface SubmitAnswer {
  questionId: string;
  lstAnswerValue: string[];
}

interface LocationState {
  examData?: ExamData;
}

/**
 * Main test screen component
 */
const TestScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state?: LocationState };
  const { id: examId } = useParams<{ id: string }>();
  
  const [testState, setTestState] = useState<TestState>(TestState.LOADING);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [currentPhase, setCurrentPhase] = useState<'Phase_1' | 'Phase_2' | 'Break_Time' | 'Phase_3' | 'Phase_4'>('Phase_1');
  //@ts-ignore: answers is not used
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  
  // Track initialization to prevent duplicate loads
  const isInitialized = useRef(false);
  const currentExamId = useRef<string | null>(null);
  
  // Validate exam ID format
  const isValidExamId = (id: string | undefined): boolean => {
    if (!id) return false;
    // Check if it's a valid UUID format or other expected format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const numericRegex = /^\d+$/; // For numeric IDs
    return uuidRegex.test(id) || numericRegex.test(id) || id.length > 0;
  };

  // Memoized fetch function to prevent recreation
  const fetchExamData = useCallback(async (id: string) => {
    const cacheKey = `exam_${id}`;
    
    // Check if we already have a pending request for this exam
    if (API_CALL_TRACKER.has(cacheKey)) {
      console.log('Using existing API call for exam ID:', id);
      try {
        const result = await API_CALL_TRACKER.get(cacheKey);
        return result;
      } catch (error) {
        // If the cached promise failed, remove it and try again
        API_CALL_TRACKER.delete(cacheKey);
      }
    }

    console.log('Starting new API call to fetch exam data for ID:', id);
    
    const apiPromise = (async () => {
      try {
        setTestState(TestState.LOADING);
        const response = await api.get<ApiResponse>(`/sat/${id}`);
        
        console.log('API response received for exam ID:', id, 'result:', response.data.result);
        
        if (response.data.result === 'OK' && response.data.data) {
          const examData = response.data.data;
          console.log('Exam data loaded successfully:', {
            examId: examData.examId,
            progress: examData.progress,
            questionCount: examData.questions.length
          });
          
          // Only update state if this is still the current exam we're trying to load
          if (currentExamId.current === id) {
            setExamData(examData);
            setCurrentPhase(examData.progress || 'Phase_1');
            setTestState(TestState.START);
          }
          
          return examData;
        } else {
          console.log('API returned error or no data for exam ID:', id);
          if (currentExamId.current === id) {
            navigate('/test/not-found', { replace: true });
          }
          throw new Error('No exam data returned');
        }
      } catch (error: any) {
        console.error('Failed to fetch exam data for ID:', id, 'error:', error);
        
        // Only handle error if this is still the current exam
        if (currentExamId.current === id) {
          if (error.response?.status === 404 || 
              error.response?.data?.message?.includes('not found') ||
              error.response?.data?.message?.includes('does not exist')) {
            navigate('/test/not-found', { replace: true });
          } else {
            setError('Failed to load exam data. Please try again.');
            setTestState(TestState.ERROR);
          }
        }
        throw error;
      } finally {
        // Clean up the tracker after the call completes
        API_CALL_TRACKER.delete(cacheKey);
        console.log('API call completed for exam ID:', id);
      }
    })();

    // Store the promise in the tracker
    API_CALL_TRACKER.set(cacheKey, apiPromise);
    
    return apiPromise;
  }, [navigate]);

  // Load exam data on component mount
  useEffect(() => {
    console.log('useEffect triggered - examId:', examId, 'isInitialized:', isInitialized.current, 'currentExamId:', currentExamId.current);
    
    // Reset initialization flag if exam ID changed
    if (currentExamId.current !== examId) {
      isInitialized.current = false;
      currentExamId.current = examId || null;
    }
    
    // Prevent duplicate initialization
    if (isInitialized.current) {
      console.log('Already initialized, skipping duplicate load');
      return;
    }

    // First check if exam ID is provided and valid format
    if (!examId || !isValidExamId(examId)) {
      console.log('Invalid exam ID, redirecting to not found');
      navigate('/test/not-found', { replace: true });
      return;
    }

    // Mark as initialized to prevent duplicate runs
    isInitialized.current = true;

    // Check if exam data was passed through navigation state
    const passedExamData = location.state?.examData;
    
    if (passedExamData) {
      // Validate that the passed exam data matches the URL exam ID
      if (passedExamData.examId === examId) {
        console.log('Loading exam data from navigation state');
        setExamData(passedExamData);
        setCurrentPhase(passedExamData.progress || 'Phase_1');
        setTestState(TestState.START);
      } else {
        // Exam ID mismatch - redirect to not found
        console.log('Exam ID mismatch, redirecting to not found');
        navigate('/test/not-found', { replace: true });
      }
    } else {
      // No exam data provided - try to fetch from API
      console.log('No navigation state data, fetching from API for examId:', examId);
      fetchExamData(examId).catch(() => {
        // Error already handled in fetchExamData
      });
    }
  }, [examId, fetchExamData, navigate, location.state]);

  /**
   * Submit answers for current phase and get next phase data
   */
  const submitPhaseAnswers = async (phaseAnswers: Record<string, string>) => {
    if (!examId || !examData) {
      return;
    }

    try {
      // Get all questions for the current phase
      const currentPhaseInfo = getCurrentPhaseInfo();
      if (!currentPhaseInfo) {
        throw new Error('Unable to get current phase info');
      }

      // Create submit data for ALL questions in the current phase
      const submitData: SubmitAnswer[] = currentPhaseInfo.questions.map(question => {
        const selectedAnswerId = phaseAnswers[question.questionId];
        let answerValue = '';
        
        if (selectedAnswerId) {
          // Find the answer object by ID to get its value
          const selectedAnswer = question.answers.find(answer => answer.answerId === selectedAnswerId);
          answerValue = selectedAnswer ? selectedAnswer.value : '';
        }
        
        return {
          questionId: question.questionId,
          lstAnswerValue: answerValue ? [answerValue] : [""]
        };
      });

      // Debug: Log the submit data to verify answer values
      console.log('Submit data with answer values:', submitData);

      const response = await api.post<ApiResponse>(`/sat/${examId}/submit`, submitData);
      
      if ((response.data.result === 'success' || response.data.result === 'OK') && response.data.data) {
        const newExamData = response.data.data;
        setExamData(newExamData);
        setCurrentPhase(newExamData.progress);
        
        // Handle different progress states
        if (newExamData.progress === 'Break_Time') {
          setTestState(TestState.BREAK);
        } else if (newExamData.progress === 'Phase_2' || newExamData.progress === 'Phase_3' || newExamData.progress === 'Phase_4') {
          setTestState(TestState.PENDING);
        } else {
          setTestState(TestState.TEST_COMPLETED);
        }
      } else {

        throw new Error('Failed to submit answers');
      }
    } catch (error) {
      console.error('Failed to submit answers:', error);
      setError('Failed to submit answers. Please try again.');
      setTestState(TestState.ERROR);
    }
  };

  // Auto-start after 8 seconds when on start screen
  useEffect(() => {
    if (testState === TestState.START) {
      const timer = setTimeout(() => {
        handleStartTest();
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [testState]);
  
  /**
   * Get current phase info
   */
  const getCurrentPhaseInfo = () => {
    if (!examData) return null;

    // During break time, there are no questions to display
    if (currentPhase === 'Break_Time') {
      return null;
    }

    const readingWritingQuestions = examData.questions.filter(q => q.questionModule === 'Reading & Writing');
    const mathQuestions = examData.questions.filter(q => q.questionModule === 'Math');
    
    switch (currentPhase) {
      case 'Phase_1':
        return {
          moduleName: 'Reading & Writing',
          partNumber: 1,
          questions: readingWritingQuestions,
          timeInMinutes: 32,
          totalQuestions: readingWritingQuestions.length
        };
      case 'Phase_2':
        return {
          moduleName: 'Reading & Writing',
          partNumber: 2,
          questions: readingWritingQuestions,
          timeInMinutes: 32,
          totalQuestions: readingWritingQuestions.length
        };
      case 'Phase_3':
        return {
          moduleName: 'Math',
          partNumber: 1,
          questions: mathQuestions,
          timeInMinutes: 35,
          totalQuestions: mathQuestions.length
        };
      case 'Phase_4':
        return {
          moduleName: 'Math',
          partNumber: 2,
          questions: mathQuestions,
          timeInMinutes: 35,
          totalQuestions: mathQuestions.length
        };
      default:
        return null;
    }
  };
  
  /**
   * Handle starting the test
   */
  const handleStartTest = () => {
    setTestState(TestState.PENDING);
  };
  
  /**
   * Handle continuing from pending screen to test
   */
  const handleContinueToTest = () => {
    setTestState(TestState.TEST_IN_PROGRESS);
  };
  
  /**
   * Handle break time completion or skip
   */
  const handleBreakComplete = () => {
    setTestState(TestState.PENDING);
  };
  
  /**
   * Handle test part completion
   */
  const handlePartComplete = (partAnswers: Record<string, string>) => {
    // Save answers locally
    setAnswers(prev => ({ ...prev, ...partAnswers }));
    
    // Submit to API
    submitPhaseAnswers(partAnswers);
  };
  
  /**
   * Handle going back to start
   */
  const handleBackToStart = () => {
    setTestState(TestState.START);
    setAnswers({});
  };
  
  /**
   * Handle exiting the test
   */
  const handleExitTest = () => {
    if (window.confirm('Are you sure you want to exit the test? Your progress will be saved.')) {
      navigate('/tests');
    }
  };

  /**
   * Convert API question format to component format
   */
  const convertApiQuestions = (apiQuestions: ExamQuestion[]) => {
    return apiQuestions.map(q => ({
      id: q.questionId,
      text: q.questionTitle,
      type: q.type,
      hasLatex: true,
      options: q.answers.map(a => ({
        id: a.answerId,
        text: a.value,
        hasLatex: true
      }))
    }));
  };
  
  /**
   * Render the current test content based on state
   */
  const renderTestContent = () => {
    switch (testState) {
      case TestState.LOADING:
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-4xl mx-auto text-center bg-white p-10 rounded-lg shadow-lg">
              <div className="flex flex-col items-center justify-center mb-8">
                <img 
                  src="https://i.gifer.com/XVo6.gif" 
                  alt="Loading..." 
                  className="w-32 h-32 mb-4"
                />
                <h2 className="text-2xl font-semibold text-gray-700">Loading exam...</h2>
              </div>
            </div>
          </div>
        );

      case TestState.ERROR:
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-4xl mx-auto text-center bg-white p-10 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
              <p className="text-gray-700 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate('/tests')}>
                  Back to Tests
                </Button>
                <Button onClick={() => navigate('/tests')}>
                  Go to Tests Page
                </Button>
              </div>
            </div>
          </div>
        );

      case TestState.START:
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-4xl mx-auto text-center bg-white p-10 rounded-lg shadow-lg">
              <div className="flex flex-col items-center justify-center mb-8">
                <img 
                  src="https://i.gifer.com/XVo6.gif" 
                  alt="Loading..." 
                  className="w-32 h-32 mb-4"
                />
                <h2 className="text-2xl font-semibold text-gray-700">Preparing your exam...</h2>
              </div>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handleExitTest}>
                  Exit
                </Button>
                <Button size="lg" onClick={handleStartTest}>
                  Start Test
                </Button>
              </div>
            </div>
          </div>
        );
        
      case TestState.PENDING: {
        const phaseInfo = getCurrentPhaseInfo();
        if (!phaseInfo) {
          // During break time or when no phase info is available
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="max-w-4xl mx-auto text-center bg-white p-10 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-700">Preparing next phase...</h2>
              </div>
            </div>
          );
        }
        
        return (
          <PendingScreen
            onStart={handleContinueToTest}
            isLoading={false}
            buttonText={`Start ${phaseInfo.moduleName} - Part ${phaseInfo.partNumber}`}
          />
        );
      }
        
      case TestState.BREAK:
        return (
          <BreakTimer
            duration={10}
            onComplete={handleBreakComplete}
          />
        );
        
      case TestState.TEST_IN_PROGRESS: {
        const phaseInfo = getCurrentPhaseInfo();
        if (!phaseInfo) return null;
        
        const convertedQuestions = convertApiQuestions(phaseInfo.questions);
        const isMathModule = phaseInfo.moduleName.toLowerCase().includes('math');
        
        if (isMathModule) {
          return (
            <MathTestScreen
              partNumber={phaseInfo.partNumber}
              questions={convertedQuestions}
              timeInMinutes={phaseInfo.timeInMinutes}
              examId={examId}
              onComplete={handlePartComplete}
            />
          );
        } else {
          return (
            <ReadingWritingTestScreen
              partNumber={phaseInfo.partNumber}
              questions={convertedQuestions}
              timeInMinutes={phaseInfo.timeInMinutes}
              examId={examId}
              onComplete={handlePartComplete}
            />
          );
        }
      }
        
      case TestState.TEST_COMPLETED:
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-4xl mx-auto text-center bg-white p-10 rounded-lg shadow-lg">
              <h1 className="text-3xl font-bold mb-6">Test Completed</h1>
              <p className="mb-8 text-lg">Thank you for completing the test!</p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate('/tests')}>
                  Return to Tests
                </Button>
                <Button onClick={handleBackToStart}>
                  Back to Start
                </Button>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="h-screen w-screen m-0 p-0 overflow-hidden flex items-center justify-center bg-slate-50 test-container">
      <div className="w-full h-full m-0 p-0">
        {renderTestContent()}
      </div>
    </div>
  );
};

export default TestScreen; 