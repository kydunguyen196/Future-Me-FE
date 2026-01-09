import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReadingWritingTestScreen from '../../components/test/ReadingWritingTestScreen';
import MathTestScreen from '../../components/test/MathTestScreen';
import BreakTimer from '../../components/test/BreakTimer';
import { Button } from '../../components/ui/button';
import api from '@/lib/axios';
import { toast } from 'react-toastify';
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

// API Interface Types
interface ExamAnswer {
  answerId: string;
  value: string;
  image?: string;
  correctAnswer: boolean;
}

interface ExamQuestion {
  questionId: string;
  level?: string;
  difficultyLevel?: string;
  type?: 'RADIO' | 'TEXT';
  questionType?: 'RADIO' | 'TEXT';
  questionTitle?: string;
  questionContent?: string;
  questionImage?: string;
  questionDomain?: string;
  questionModule?: 'Reading & Writing' | 'Math';
  moduleName?: 'Reading & Writing' | 'Math';
  answers?: ExamAnswer[];
  questionOptions?: Array<{
    questionOptionId: string;
    value: string;
  }>;
}

interface ExamData {
  examId: string;
  progress: 'Phase_1' | 'Phase_2' | 'Break_Time' | 'Phase_3' | 'Phase_4' | 'Section_1' | 'Section_2' | 'Section_3' | 'Section_4' | 'End';
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
  const location = useLocation();
  
  const [testState, setTestState] = useState<TestState>(TestState.LOADING);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [currentPhase, setCurrentPhase] = useState<'Phase_1' | 'Phase_2' | 'Break_Time' | 'Phase_3' | 'Phase_4' | 'Section_1' | 'Section_2' | 'Section_3' | 'Section_4' | 'End'>('Section_1');
  //@ts-ignore: answers is not used
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  
  // Track initialization to prevent duplicate loads
  const isInitialized = useRef(false);

  // Handle navigation to results page when test is completed
  useEffect(() => {
    const handleTestCompletion = async () => {
      if (testState === TestState.TEST_COMPLETED && examData) {
        console.log('Test completed! Redirecting to results page...');
        toast.success('Test completed successfully!');
        
        // Navigate directly to results page without calling report API
        navigate(`/test-results/${examData.examId}`, { replace: true });
      } else if (testState === TestState.TEST_COMPLETED && !examData) {
        // Fallback to demo results if no exam data
        navigate('/test-results/demo?demo=true', { replace: true });
      }
    };

    handleTestCompletion();
  }, [testState, examData, navigate]);

  // Auto-start after 8 seconds when on start screen
  useEffect(() => {
    if (testState === TestState.START) {
      const timer = setTimeout(() => {
        setTestState(TestState.TEST_IN_PROGRESS);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [testState]);

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
        console.log('📡 Making API call to:', `/sat/${id}`);
        const response = await api.get<ApiResponse>(`/sat/${id}`);
        
        console.log('📡 API response received for exam ID:', id);
        console.log('📡 Response status:', response.status);
        console.log('📡 Response data:', response.data);
        
        if (response.data.result === 'OK' && response.data.data) {
          const examData = response.data.data;
          console.log('✅ Exam data loaded successfully:', {
            examId: examData.examId,
            progress: examData.progress,
            questionCount: examData.questions.length
          });
          
          // Only update state if this is still the current exam we're trying to load
          if (isInitialized.current) {
            setExamData(examData);
            setCurrentPhase(examData.progress || 'Phase_1');
            setTestState(TestState.START);
            toast.success('Exam loaded successfully!');
          }
          
          return examData;
        } else {
          console.log('❌ API returned error or no data for exam ID:', id);
          console.log('❌ Response result:', response.data.result);
          console.log('❌ Response data exists:', !!response.data.data);
          if (isInitialized.current) {
            navigate('/test/not-found', { replace: true });
          }
          throw new Error('No exam data returned');
        }
      } catch (error: any) {
        console.error('❌ Failed to fetch exam data for ID:', id);
        console.error('❌ Error details:', error);
        console.error('❌ Error response:', error.response);
        
        // Only handle error if this is still the current exam
        if (isInitialized.current) {
          if (error.response?.status === 404 || 
              error.response?.data?.message?.includes('not found') ||
              error.response?.data?.message?.includes('does not exist')) {
            console.log('❌ 404 error, redirecting to not found');
            navigate('/test/not-found', { replace: true });
          } else {
            console.log('❌ Other error, showing error state');
            setError('Failed to load exam data. Please try again.');
            setTestState(TestState.ERROR);
            toast.error('Failed to get the exam. Please check your connection and try again.');
          }
        }
        throw error;
      } finally {
        // Clean up the tracker after the call completes
        API_CALL_TRACKER.delete(cacheKey);
        console.log('🧹 API call completed for exam ID:', id);
      }
    })();

    // Store the promise in the tracker
    API_CALL_TRACKER.set(cacheKey, apiPromise);
    
    return apiPromise;
  }, [navigate]);

  // Function to create a new exam
  const createNewExam = useCallback(async () => {
    try {
      console.log('🆕 Getting new exam...');
      setTestState(TestState.LOADING);
      
      // Get a new exam using the exam endpoint
      const response = await api.get<ApiResponse>('/sat/exam');
      
      if (response.data.result === 'OK' && response.data.data) {
        const examData = response.data.data;
        console.log('✅ New exam loaded successfully:', examData.examId);
        
        // Set the exam data and phase first
        setExamData(examData);
        
        // Use the API progress directly - the mapping will happen in getCurrentPhaseInfo
        let targetPhase = examData.progress || 'Section_1';
        
        // If we're coming after break time, move to Phase 3 (Math)
        if (currentPhase === 'Break_Time') {
          targetPhase = 'Section_3';
        }
        
        setCurrentPhase(targetPhase);
        
        // Go to START state first to allow state to settle, then auto-start
        setTestState(TestState.START);
        toast.success('Exam loaded successfully!');
        
        return examData;
      } else {
        throw new Error('Failed to get new exam');
      }
    } catch (error: any) {
      console.error('❌ Failed to get new exam:', error);
      setError('Failed to load exam. Please try again.');
      setTestState(TestState.ERROR);
      toast.error('Failed to start the exam. Please check your connection and try again.');
    }
  }, [currentPhase]);

  // Load exam data on component mount
  useEffect(() => {
    console.log('=== TestScreen useEffect START ===');
    console.log('isInitialized.current:', isInitialized.current);
    console.log('location.pathname:', location.pathname);
    console.log('location.state:', location.state);
    
    // Prevent duplicate initialization
    if (isInitialized.current) {
      console.log('Already initialized, skipping duplicate load');
      return;
    }

    // Mark as initialized to prevent duplicate runs
    isInitialized.current = true;

    // Check if exam data was passed through navigation state
    const passedExamData = (location.state as LocationState)?.examData;
    
    if (passedExamData) {
      console.log('Found exam data in navigation state:', passedExamData);
      setExamData(passedExamData);
      setCurrentPhase(passedExamData.progress || 'Phase_1');
      setTestState(TestState.TEST_IN_PROGRESS);
    } else {
      // No exam data provided - get new exam from API
      console.log('🆕 No exam data provided, getting new exam...');
      createNewExam().catch((error) => {
        console.log('createNewExam failed:', error);
        // Error already handled in createNewExam
      });
    }
    
    console.log('=== TestScreen useEffect END ===');
  }, [createNewExam, location]);

  /**
   * Submit answers and fetch next phase data
   */
  const submitAnswersAndFetchNextPhase = async (phaseAnswers: Record<string, string>) => {
    if (!examData) return;

    try {
      // Show loading state
      setTestState(TestState.LOADING);

      // Get current phase info to know which questions belong to this phase
      const phaseInfo = getCurrentPhaseInfo();
      if (!phaseInfo) return;

      // Convert answers to API format - array of objects with questionId and lstAnswerValue
      const submitData: SubmitAnswer[] = phaseInfo.questions.map(question => {
        const userAnswer = phaseAnswers[question.questionId]; // Use questionId from raw API questions
        
        if (userAnswer) {
          // Find the original question to check its type
          const originalQuestion = examData.questions.find(q => q.questionId === question.questionId);
          
          if (originalQuestion?.type === 'TEXT' || originalQuestion?.questionType === 'TEXT') {
            // For TEXT questions, submit the direct text input
            return {
              questionId: question.questionId,
              lstAnswerValue: [userAnswer]
            };
          } else {
            // For RADIO questions, find the corresponding answer object to get the actual value
            const answers = originalQuestion?.answers || originalQuestion?.questionOptions || [];
            const selectedAnswer = answers.find((a: any) => 
              (a.answerId === userAnswer) || (a.questionOptionId === userAnswer)
            );
            
            return {
              questionId: question.questionId,
              lstAnswerValue: selectedAnswer ? [selectedAnswer.value] : [""]
            };
          }
        } else {
          // No answer provided
          return {
            questionId: question.questionId,
            lstAnswerValue: [""]
          };
        }
      });

      // Submit answers and get updated exam data
      const response = await api.post(`/sat/exam/${examData.examId}/submit`, submitData);
      
      if (response.data.result === 'OK' && response.data.data) {
        // Update exam data with new phase information
        const updatedExamData = response.data.data;
        setExamData(updatedExamData);
        
        // Use the progress from the updated exam data directly
        setCurrentPhase(updatedExamData.progress);
        
        // Set the appropriate test state based on the progress
        if (updatedExamData.progress === 'Break_Time') {
          console.log('Answers submitted successfully, entering break time');
          setTestState(TestState.BREAK);
          toast.success('Section completed! Time for a break.');
        } else if (updatedExamData.progress === 'End') {
          console.log('🎉 Test completed! All sections finished.');
          setTestState(TestState.TEST_COMPLETED);
          toast.success('Congratulations! Test completed successfully!');
        } else {
          console.log('Answers submitted successfully, moving to next phase:', updatedExamData.progress);
          setTestState(TestState.TEST_IN_PROGRESS);
          toast.success('Answers submitted successfully!');
        }
      } else {
        console.error('Failed to submit answers:', response.data);
        toast.error('Failed to submit answers. Please try again.');
        // Still move to next phase even if submission failed
        moveToNextPhase();
      }
    } catch (error) {
      console.error('Error submitting answers:', error);
      toast.error('Failed to submit answers. Please check your connection.');
      // Still move to next phase even if submission failed
      moveToNextPhase();
    }
  };
  
  /**
   * Map API phase names to frontend phase names
   */
  const mapApiPhaseToFrontendPhase = (apiPhase: 'Phase_1' | 'Phase_2' | 'Break_Time' | 'Phase_3' | 'Phase_4' | 'Section_1' | 'Section_2' | 'Section_3' | 'Section_4' | 'End'): 'Phase_1' | 'Phase_2' | 'Break_Time' | 'Phase_3' | 'Phase_4' | null => {
    switch (apiPhase) {
      case 'Section_1':
        return 'Phase_1';
      case 'Section_2':
        return 'Phase_2';
      case 'Break_Time':
        return 'Break_Time';
      case 'Section_3':
        return 'Phase_3';
      case 'Section_4':
        return 'Phase_4';
      // Also handle the old format
      case 'Phase_1':
        return 'Phase_1';
      case 'Phase_2':
        return 'Phase_2';
      case 'Phase_3':
        return 'Phase_3';
      case 'Phase_4':
        return 'Phase_4';
      case 'End':
        console.log('Test has ended, returning null for phase mapping');
        return null;
      default:
        console.warn('Unknown API phase:', apiPhase, 'defaulting to Phase_1');
        return 'Phase_1';
    }
  };

  /**
   * Get current test phase info
   */
  const getCurrentPhaseInfo = () => {
    console.log('getCurrentPhaseInfo called - examData:', !!examData, 'currentPhase:', currentPhase);
    
    if (!examData) {
      console.log('getCurrentPhaseInfo: No examData, returning null');
      return null;
    }

    // Map the current phase to the expected format
    const mappedPhase = mapApiPhaseToFrontendPhase(currentPhase);
    console.log('getCurrentPhaseInfo: Mapped phase:', currentPhase, '->', mappedPhase);

    // During break time or when test has ended, there are no questions to display
    if (mappedPhase === 'Break_Time' || mappedPhase === null) {
      console.log('getCurrentPhaseInfo: Break time or test ended, returning null');
      return null;
    }

    const readingWritingQuestions = examData.questions.filter(q => 
      (q.questionModule === 'Reading & Writing') || (q.moduleName === 'Reading & Writing')
    );
    const mathQuestions = examData.questions.filter(q => 
      (q.questionModule === 'Math') || (q.moduleName === 'Math')
    );
    
    console.log('getCurrentPhaseInfo: RW questions:', readingWritingQuestions.length, 'Math questions:', mathQuestions.length);
    
    switch (mappedPhase) {
      case 'Phase_1':
        console.log('getCurrentPhaseInfo: Phase_1 - RW Part 1');
        return {
          moduleName: 'Reading & Writing',
          partNumber: 1,
          questions: readingWritingQuestions,
          timeInMinutes: 32,
          totalQuestions: readingWritingQuestions.length
        };
      case 'Phase_2':
        console.log('getCurrentPhaseInfo: Phase_2 - RW Part 2');
        return {
          moduleName: 'Reading & Writing',
          partNumber: 2,
          questions: readingWritingQuestions,
          timeInMinutes: 32,
          totalQuestions: readingWritingQuestions.length
        };
      case 'Phase_3':
        console.log('getCurrentPhaseInfo: Phase_3 - Math Part 1');
        return {
          moduleName: 'Math',
          partNumber: 1,
          questions: mathQuestions,
          timeInMinutes: 35,
          totalQuestions: mathQuestions.length
        };
      case 'Phase_4':
        console.log('getCurrentPhaseInfo: Phase_4 - Math Part 2');
        return {
          moduleName: 'Math',
          partNumber: 2,
          questions: mathQuestions,
          timeInMinutes: 35,
          totalQuestions: mathQuestions.length
        };
      default:
        console.log('getCurrentPhaseInfo: Unknown mapped phase:', mappedPhase, 'returning null');
        return null;
    }
  };
  
  /**
   * Move to the next test phase
   */
  const moveToNextPhase = () => {
    console.log(`Moving from ${currentPhase} to next phase...`);
    
    switch (currentPhase) {
      case 'Phase_1':
      case 'Section_1':
        console.log('Completed Phase 1 (Reading & Writing Part 1), moving to Phase 2');
        setCurrentPhase('Section_2');
        setTestState(TestState.TEST_IN_PROGRESS);
        break;
      case 'Phase_2':
      case 'Section_2':
        console.log('Completed Phase 2 (Reading & Writing Part 2), moving to Break Time');
        setCurrentPhase('Break_Time');
        setTestState(TestState.BREAK);
        break;
      case 'Phase_3':
      case 'Section_3':
        console.log('Completed Phase 3 (Math Part 1), moving to Phase 4');
        setCurrentPhase('Section_4');
        setTestState(TestState.TEST_IN_PROGRESS);
        break;
      case 'Phase_4':
      case 'Section_4':
        console.log('🎉 Completed Section 4 (Math Part 2) - All test sections completed!');
        console.log('🏁 Test finished! Final sequence: Section 1 → Section 2 → Break → Section 3 → Section 4 → Results');
        setTestState(TestState.TEST_COMPLETED);
        break;
      default:
        console.log('Unknown phase:', currentPhase);
        break;
    }
  };
  
  /**
   * Handle break time completion or skip
   */
  const handleBreakComplete = async () => {
    if (!examData) return;

    try {
      console.log('Break completed, submitting empty answers and fetching Math module data...');
      setTestState(TestState.LOADING);
      
      // Send POST request with empty array to complete break time
      const response = await api.post(`/sat/exam/${examData.examId}/submit`, []);
      
      if (response.data.result === 'OK' && response.data.data) {
        // Update exam data with Math module information
        const updatedExamData = response.data.data;
        setExamData(updatedExamData);
        setCurrentPhase('Section_3'); // Move to Math Part 1
        setTestState(TestState.TEST_IN_PROGRESS);
        
        console.log('Math module data loaded successfully, moving to Phase 3');
        toast.success('Math module loaded successfully!');
      } else {
        console.error('Failed to get Math module data:', response.data);
        toast.error('Failed to load Math module. Please try again.');
        // Fallback to just moving to Phase 3 if API call fails
        setCurrentPhase('Section_3');
        setTestState(TestState.TEST_IN_PROGRESS);
      }
    } catch (error) {
      console.error('Error submitting break completion and getting Math data:', error);
      toast.error('Failed to load Math module. Please check your connection.');
      // Fallback to just moving to Phase 3 if API call fails
      setCurrentPhase('Section_3');
      setTestState(TestState.TEST_IN_PROGRESS);
    }
  };
  
  /**
   * Handle test part completion
   */
  const handlePartComplete = (partAnswers: Record<string, string>) => {
    // Save answers locally
    setAnswers(prev => ({ ...prev, ...partAnswers }));
    
    // Submit to API
    submitAnswersAndFetchNextPhase(partAnswers);
  };
  

  /**
   * Convert API question format to component format
   */
  const convertApiQuestions = (apiQuestions: any[]) => {
    return apiQuestions.map(q => ({
      id: q.questionId,
      text: q.questionContent || q.questionTitle, // Support both API formats
      type: q.questionType || q.type, // Support both API formats
      image: q.questionImage, // Include question image
      hasLatex: true,
      options: (q.questionType === 'TEXT' || q.type === 'TEXT') ? [] : (q.questionOptions || q.answers || []).map((a: any) => ({
        id: a.questionOptionId || a.answerId, // Support both API formats
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
          <div className="flex items-center justify-center min-h-screen w-full">
            <div className="max-w-4xl mx-auto text-center bg-white p-10 rounded-lg shadow-lg">
              <div className="flex flex-col items-center justify-center mb-8">
                <img 
                  src="https://i.gifer.com/XVo6.gif" 
                  alt="Loading..." 
                  className="w-32 h-32 mb-4"
                />
                <h2 className="text-2xl font-semibold text-gray-700">
                  {examData ? 'Loading next module...' : 'Loading exam...'}
                </h2>
              </div>
            </div>
          </div>
        );

      case TestState.ERROR:
        return (
          <div className="flex items-center justify-center min-h-screen w-full">
            <div className="max-w-4xl mx-auto text-center bg-white p-10 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
              <p className="text-gray-700 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate('/tests')}>
                  Back to Tests
                </Button>
                <Button onClick={() => examData && fetchExamData(examData.examId)}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        );

      case TestState.START:
        return (
          <div className="flex items-center justify-center min-h-screen w-full">
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
                <Button variant="outline" onClick={() => navigate('/tests')}>
                  Exit
                </Button>
                <Button size="lg" onClick={() => setTestState(TestState.TEST_IN_PROGRESS)}>
                  Start Test
                </Button>
              </div>
            </div>
          </div>
        );
        
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
              examId={examData?.examId || ''}
              onComplete={handlePartComplete}
            />
          );
        } else {
          return (
            <ReadingWritingTestScreen
              partNumber={phaseInfo.partNumber}
              questions={convertedQuestions}
              timeInMinutes={phaseInfo.timeInMinutes}
              examId={examData?.examId || ''}
              onComplete={handlePartComplete}
            />
          );
        }
      }
        
      case TestState.TEST_COMPLETED:
        return (
          <div className="flex items-center justify-center min-h-screen w-full">
            <div className="max-w-4xl mx-auto text-center bg-white p-10 rounded-lg shadow-lg">
              <h1 className="text-3xl font-bold mb-6">Test Completed!</h1>
              <p className="mb-4 text-lg">Congratulations! You have completed all sections of the test.</p>
              <p className="mb-8 text-gray-600">Redirecting to your results...</p>
              <div className="flex justify-center">
                <img 
                  src="https://i.gifer.com/XVo6.gif" 
                  alt="Redirecting to results..." 
                  className="w-16 h-16"
                />
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen w-full m-0 p-0 overflow-y-auto overflow-x-hidden bg-slate-50 test-container">
      {renderTestContent()}
    </div>
  );
};

export default TestScreen; 