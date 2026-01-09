import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import TestResultScreen from '../../components/test/TestResultScreen';
import api from '@/lib/axios';

// Types for API response matching the new response.data format
interface ApiAnswer {
  questionOptionId: string;
  value: string;
  isCorrect: boolean;
}

interface ApiChosenAnswer {
  satQuestionAnswerId: string;
  value: string;
}

interface ApiQuestion {
  questionOrder: number;
  questionId: string;
  difficultyLevel: 'EASY' | 'Easy' | 'MEDIUM' | 'Medium' | 'HARD' | 'Hard';
  questionType: string;
  questionContent: string;
  questionImage?: string;
  questionSkill: string;
  questionDomain: string;
  questionModule: string;
  answers: ApiAnswer[];
  chosenAnswers: ApiChosenAnswer[];
  correct: boolean;
  verify: boolean;
}

interface ApiSection {
  section: string;
  numberCorrectAnswer: number;
  totalQuestion: number;
  questions: ApiQuestion[];
}

interface ApiDomain {
  domainName: string;
  numberCorrectAnswer: number;
  totalQuestion: number;
}

interface ApiModule {
  moduleName: string;
  finalScore: number;
  domains: ApiDomain[];
  sections: ApiSection[];
}

interface ApiTestResult {
  accountId: string;
  examId: string;
  startTime: string;
  endTime: string;
  progress: string;
  finalScore: number;
  modules: ApiModule[];
}

interface ApiResponse {
  result: string;
  correlationId: string;
  data: ApiTestResult;
}

// Interface for test statistics response
interface ApiStatisticsDomain {
  domainName: string;
  numberCorrectAnswer: number;
  totalQuestion: number;
}

interface ApiStatisticsModule {
  moduleName: string;
  finalScore: number;
  domains: ApiStatisticsDomain[];
}

interface ApiStatisticsData {
  accountId: string;
  examId: string;
  startTime: string;
  endTime: string;
  progress: string;
  finalScore: number;
  modules: ApiStatisticsModule[];
}

interface ApiStatisticsResponse {
  result: string;
  correlationId: string;
  data: ApiStatisticsData;
}

// Transform API data to component format
const transformApiDataToComponentFormat = (apiData: ApiTestResult) => {
  const startTime = new Date(apiData.startTime);
  const endTime = new Date(apiData.endTime);
  const totalTimeMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

  // Calculate total questions and correct answers across all modules
  let totalQuestions = 0;
  let totalCorrect = 0;
  const moduleScores: Array<{
    module: 'Reading & Writing' | 'Math';
    score: number;
    maxScore: number;
    percentile: number;
    totalQuestions: number;
    correctAnswers: number;
  }> = [];

  const questionResults: Array<{
    questionId: string;
    questionNumber: number;
    module: 'Reading & Writing' | 'Math';
    difficulty: 'Easy' | 'Medium' | 'Hard';
    skill: string;
    topic: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
    originalData?: {
      questionOrder: number;
      questionId: string;
      difficultyLevel: string;
      questionType: string;
      questionContent: string;
      questionImage?: string;
      questionSkill: string;
      questionDomain: string;
      questionModule: string;
      answers: ApiAnswer[];
      chosenAnswers: ApiChosenAnswer[];
      correct: boolean;
      verify: boolean;
    };
  }> = [];

  apiData.modules.forEach((module) => {
    const moduleQuestions = module.sections.flatMap(section => section.questions);
    const moduleCorrect = moduleQuestions.filter(q => q.correct).length;
    totalQuestions += moduleQuestions.length;
    totalCorrect += moduleCorrect;

    // Map module name to match component expectations
    const moduleName = module.moduleName === 'Reading & Writing' ? 'Reading & Writing' : 'Math';
    
    // Calculate estimated percentile based on score (this is a simplified calculation)
    const scorePercentage = (module.finalScore / 800) * 100;
    const estimatedPercentile = Math.min(99, Math.max(1, Math.round(scorePercentage * 0.9)));

    moduleScores.push({
      module: moduleName,
      score: module.finalScore,
      maxScore: 800,
      percentile: estimatedPercentile,
      totalQuestions: moduleQuestions.length,
      correctAnswers: moduleCorrect
    });

    // Transform questions
    moduleQuestions.forEach((question, index) => {
      const normalizedDifficulty = question.difficultyLevel === 'EASY' || question.difficultyLevel === 'Easy' ? 'Easy' :
                                   question.difficultyLevel === 'MEDIUM' || question.difficultyLevel === 'Medium' ? 'Medium' : 'Hard';
      
      const correctAnswer = question.answers.find(a => a.isCorrect)?.value || '';
      const userAnswer = question.chosenAnswers[0]?.value || '';
      
      questionResults.push({
        questionId: question.questionId,
        questionNumber: question.questionOrder || index + 1,
        module: moduleName,
        difficulty: normalizedDifficulty,
        skill: question.questionSkill,
        topic: question.questionType,
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        isCorrect: question.correct,
        timeSpent: Math.floor(Math.random() * 120) + 30, // Placeholder since time data not available
        originalData: {
          questionOrder: question.questionOrder,
          questionId: question.questionId,
          difficultyLevel: question.difficultyLevel,
          questionType: question.questionType,
          questionContent: question.questionContent,
          questionImage: question.questionImage,
          questionSkill: question.questionSkill,
          questionDomain: question.questionDomain,
          questionModule: question.questionModule,
          answers: question.answers,
          chosenAnswers: question.chosenAnswers,
          correct: question.correct,
          verify: question.verify
        }
      });
    });
  });

  // Calculate the correct total score based on available modules
  const calculateAdjustedTotalScore = () => {
    const availableModules = apiData.modules.map(m => m.moduleName);
    const hasReadingWriting = availableModules.includes('Reading & Writing');
    const hasMath = availableModules.includes('Math');
    
    let adjustedTotal = 0;
    
    // Add actual module scores
    apiData.modules.forEach(module => {
      adjustedTotal += module.finalScore;
    });
    
    // Add default 200 for missing modules
    if (!hasReadingWriting) {
      adjustedTotal += 200;
    }
    if (!hasMath) {
      adjustedTotal += 200;
    }
    
    return adjustedTotal;
  };

  const adjustedTotalScore = calculateAdjustedTotalScore();

  // Calculate overall percentile based on adjusted total score
  const totalScorePercentage = (adjustedTotalScore / 1600) * 100;
  const overallPercentile = Math.min(99, Math.max(1, Math.round(totalScorePercentage * 0.9)));

  return {
    testId: apiData.examId,
    testName: 'SAT Practice Test',
    testDate: new Date(apiData.startTime).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    totalScore: adjustedTotalScore,
    maxTotalScore: 1600,
    totalTime: totalTimeMinutes,
    percentile: overallPercentile,
    moduleScores,
    questionResults
  };
};

// Sample data for demonstration (keeping for fallback)
const sampleResultData = {
  testId: "sat-practice-test-1",
  testName: "SAT Practice Test 1",
  testDate: new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }),
  totalScore: 1480,
  maxTotalScore: 1600,
  totalTime: 180,
  percentile: 85,
  moduleScores: [
    {
      module: 'Reading & Writing' as const,
      score: 750,
      maxScore: 800,
      percentile: 82,
      totalQuestions: 54,
      correctAnswers: 47
    },
    {
      module: 'Math' as const,
      score: 730,
      maxScore: 800,
      percentile: 88,
      totalQuestions: 44,
      correctAnswers: 38
    }
  ],
  questionResults: [
    // Reading & Writing questions
    ...Array.from({ length: 54 }, (_, i) => ({
      questionId: `rw-${i + 1}`,
      questionNumber: i + 1,
      module: 'Reading & Writing' as const,
      difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)] as 'Easy' | 'Medium' | 'Hard',
      skill: [
        'Information and Ideas',
        'Craft and Structure', 
        'Expression of Ideas',
        'Standard English Conventions'
      ][Math.floor(Math.random() * 4)],
      topic: [
        'Reading Comprehension',
        'Writing and Language',
        'Grammar',
        'Vocabulary in Context'
      ][Math.floor(Math.random() * 4)],
      userAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      correctAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      isCorrect: Math.random() > 0.13, // ~87% correct rate
      timeSpent: Math.floor(Math.random() * 120) + 30 // 30-150 seconds
    })),
    // Math questions
    ...Array.from({ length: 44 }, (_, i) => ({
      questionId: `math-${i + 1}`,
      questionNumber: i + 1,
      module: 'Math' as const,
      difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)] as 'Easy' | 'Medium' | 'Hard',
      skill: [
        'Algebra',
        'Advanced Math',
        'Problem-Solving and Data Analysis',
        'Geometry and Trigonometry'
      ][Math.floor(Math.random() * 4)],
      topic: [
        'Linear Equations',
        'Statistics',
        'Geometry',
        'Trigonometry',
        'Functions'
      ][Math.floor(Math.random() * 5)],
      userAnswer: Math.random() > 0.1 ? (Math.floor(Math.random() * 100) + 1).toString() : '',
      correctAnswer: (Math.floor(Math.random() * 100) + 1).toString(),
      isCorrect: Math.random() > 0.14, // ~86% correct rate
      timeSpent: Math.floor(Math.random() * 180) + 45 // 45-225 seconds
    }))
  ]
};

// Ensure the isCorrect matches the module scores
sampleResultData.questionResults.forEach((question) => {
  if (question.module === 'Reading & Writing') {
    const rwIndex = sampleResultData.questionResults.filter(q => q.module === 'Reading & Writing').indexOf(question);
    question.isCorrect = rwIndex < 47; // First 47 are correct
    if (question.isCorrect) {
      question.userAnswer = question.correctAnswer;
    }
  } else {
    const mathIndex = sampleResultData.questionResults.filter(q => q.module === 'Math').indexOf(question);
    question.isCorrect = mathIndex < 38; // First 38 are correct
    if (question.isCorrect) {
      question.userAnswer = question.correctAnswer;
    }
  }
});

// Loading skeleton component
const ResultsLoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
            <div className="h-10 w-40 bg-gray-200 rounded"></div>
          </div>
          
          <div className="text-center mb-6">
            <div className="h-8 w-64 bg-gray-200 rounded mx-auto mb-4"></div>
            <div className="h-4 w-40 bg-gray-200 rounded mx-auto"></div>
          </div>
          
          {/* Score cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4">
                <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-2"></div>
                <div className="h-4 w-20 bg-gray-200 rounded mx-auto mb-1"></div>
                <div className="h-3 w-16 bg-gray-200 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Module scores skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
              <div className="flex justify-between items-center mb-4">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-12 bg-gray-200 rounded"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-5 w-12 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab navigation skeleton */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b p-6">
            <div className="flex space-x-8 justify-center">
              <div className="h-6 w-20 bg-gray-200 rounded"></div>
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-6">
                    <div className="h-6 w-40 bg-gray-200 rounded mx-auto mb-4"></div>
                    <div className="w-48 h-48 bg-gray-100 rounded-full mx-auto mb-4"></div>
                    <div className="space-y-2">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="flex justify-between">
                          <div className="h-3 w-24 bg-gray-200 rounded"></div>
                          <div className="h-3 w-8 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { examId } = useParams<{ examId: string }>();
  const [searchParams] = useSearchParams();
  const [resultData, setResultData] = useState<any>(null);
  const [statisticsData, setStatisticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTestResults = async () => {
      try {
        setLoading(true);
        const useSampleData = searchParams.get('demo') === 'true';

        if (useSampleData || !examId) {
          setResultData(sampleResultData);
          setLoading(false);
          return;
        }

        try {
          const [resultsResponse, statisticsResponse] = await Promise.all([
            api.get<ApiResponse>(`/sat/exam/${examId}/report-details`),
            api.get<ApiStatisticsResponse>(`/sat/exam/${examId}/report`)
          ]);

          if (resultsResponse.data.result === 'OK' && resultsResponse.data.data) {
            const transformedData = transformApiDataToComponentFormat(resultsResponse.data.data);
            setResultData(transformedData);
          } else {
            throw new Error('Invalid response format');
          }

          if (statisticsResponse.data.result === 'OK' && statisticsResponse.data.data) {
            setStatisticsData(statisticsResponse.data.data);
          } else {
            console.warn('Statistics data not available or invalid format');
          }
        } catch (apiError) {
          console.warn('Failed to fetch results from API, using response.json data:', apiError);
          setResultData(sampleResultData);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading test results:', error);
        setError('Failed to load test results. Please try again.');
        setLoading(false);
      }
    };

    loadTestResults();
  }, [examId, searchParams]);

  const handleReturnToTests = () => {
    navigate('/tests');
  };

  const handleRetakeTest = () => {
    if (examId) {
      navigate(`/test/screen`);
    } else {
      navigate('/test/screen');
    }
  };

  const handleDownloadReport = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; color: #1f2937; margin-bottom: 10px;">${resultData.testName}</h1>
        <p style="text-align: center; color: #6b7280; margin-bottom: 30px;">${resultData.testDate}</p>
        
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
          <div style="text-align: center; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${resultData.totalScore}</div>
            <div style="font-size: 12px; color: #6b7280;">Total Score</div>
          </div>
          <div style="text-align: center; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: bold; color: #059669;">${resultData.percentile}%</div>
            <div style="font-size: 12px; color: #6b7280;">Percentile</div>
          </div>
          <div style="text-align: center; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: bold; color: #16a34a;">${Math.round((resultData.questionResults.filter((q: any) => q.isCorrect).length / resultData.questionResults.length) * 100)}%</div>
            <div style="font-size: 12px; color: #6b7280;">Accuracy</div>
          </div>
          <div style="text-align: center; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: bold; color: #7c3aed;">${resultData.totalTime}</div>
            <div style="font-size: 12px; color: #6b7280;">Minutes</div>
          </div>
        </div>
        
        <h2 style="color: #1f2937; margin-bottom: 15px;">Module Scores</h2>
        ${resultData.moduleScores.map((module: any) => `
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">${module.module}</h3>
            <p style="margin: 5px 0; color: #4b5563;">Score: ${module.score}/${module.maxScore}</p>
            <p style="margin: 5px 0; color: #4b5563;">Percentile: ${module.percentile}%</p>
            <p style="margin: 5px 0; color: #4b5563;">Correct: ${module.correctAnswers}/${module.totalQuestions}</p>
          </div>
        `).join('')}
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${resultData.testName} - Results</title>
            <style>
              body { margin: 0; padding: 20px; }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleShareOnFacebook = () => {
  if (!examId) return;

  try {
    const baseUrl = process.env.VITE_BASE_URL || 'https://futureme.com.vn'; // Sử dụng process.env thay vì import.meta.env
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      `${baseUrl}/test-result/${examId}`
    )}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    toast.success('Chia sẻ thành công!');
  } catch (error) {
    console.error('Error opening share dialog:', error);
    toast.error('Không thể mở cửa sổ chia sẻ. Vui lòng thử lại!');
  }
};

  const renderHelmet = () => {
  if (!resultData || !examId) return null;

  const totalScore = resultData.totalScore || 0;
  const readingScore = resultData.moduleScores && Array.isArray(resultData.moduleScores)
    ? resultData.moduleScores.find(m => m.module === 'Reading & Writing')?.score || 0
    : 0;

  return (
    <Helmet>
      <title>Kết quả SAT Practice Test của tôi</title>
      <meta property="og:title" content="Kết quả SAT Practice Test của tôi" />
      <meta property="og:description" content={`Tổng điểm: ${totalScore}/1600, Đọc & Viết: ${readingScore}/800`} />
      <meta property="og:image" content={import.meta.env.VITE_DEFAULT_IMAGE_URL} />
      <meta property="og:url" content={`${import.meta.env.VITE_BASE_URL}/test-result/${examId}`} />
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content="Future Me" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
    </Helmet>
  );
};

  if (loading) {
    return <ResultsLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center overflow-y-auto">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">{t('testResults.errorLoading')}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/tests')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              {t('testResults.backToTestsButton')}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {t('testResults.tryAgain')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center overflow-y-auto">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('testResults.noResultsFound')}</h2>
          <p className="text-gray-600 mb-6">{t('testResults.noResultsMessage')}</p>
          <button
            onClick={() => navigate('/tests')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t('testResults.backToTestsButton')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-y-auto">
      {renderHelmet()} {/* Inject meta tags động */}
      <TestResultScreen
        resultData={resultData}
        statisticsData={statisticsData}
        onReturnToTests={handleReturnToTests}
        onRetakeTest={handleRetakeTest}
        onDownloadReport={handleDownloadReport}
        onShareOnFacebook={handleShareOnFacebook}
      />
    </div>
  );
};

export default TestResultPage; 