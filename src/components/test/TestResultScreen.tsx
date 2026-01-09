import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { CheckCircle, XCircle, ArrowLeft, RotateCcw, Calendar, Eye, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '@/lib/axios';
import LatexRenderer from './LatexRenderer';
import domToImage from 'dom-to-image';
import axios from 'axios';

// Utility function to safely render text content with HTML and newlines
const renderTextContent = (content: string, isMathModule = false) => {
  if (!content) return null;

  const cleanContent = content.trim();

  if (isMathModule) {
    return <LatexRenderer content={cleanContent} />;
  }

  const hasHtmlTags = /<(?!\s*\/?\s*(?:br|p|div|span|strong|b|i|em|u)\s*\/?\s*>)[^>]*>/gi.test(cleanContent) ||
    /<(p|div|span|strong|b|i|em|u)(\s[^>]*)?>/gi.test(cleanContent);

  if (hasHtmlTags) {
    return (
      <div
        className="text-left"
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />
    );
  } else {
    const parts = cleanContent
      .replace(/<br\s*\/?>/gi, '\n')
      .split(/\\n|\\r\\n|\r\n|\n/);

    if (parts.length === 1) {
      return <span className="text-left">{cleanContent}</span>;
    }

    return (
      <div className="text-left">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part.trim()}
            {index < parts.length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    );
  }
};

// Types for test results
interface OriginalQuestionData {
  questionOrder: number;
  questionId: string;
  difficultyLevel: string;
  questionType: string;
  questionContent: string;
  questionImage?: string;
  questionSkill: string;
  questionDomain: string;
  questionModule: string;
  answers: {
    questionOptionId: string;
    value: string;
    isCorrect: boolean;
  }[];
  chosenAnswers: {
    satQuestionAnswerId: string;
    value: string;
  }[];
  correct: boolean;
  verify: boolean;
}

interface QuestionResult {
  questionId: string;
  questionNumber: number;
  module: 'Reading & Writing' | 'Math';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  skill: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  topic: string;
  originalData?: OriginalQuestionData;
}

interface ModuleScore {
  module: 'Reading & Writing' | 'Math';
  score: number;
  maxScore: number;
  percentile: number;
  totalQuestions: number;
  correctAnswers: number;
}

interface TestResultData {
  testId: string;
  testName: string;
  testDate: string;
  totalScore: number;
  maxTotalScore: number;
  totalTime: number;
  moduleScores: ModuleScore[];
  questionResults: QuestionResult[];
  percentile: number;
}

interface StatisticsDomain {
  domainName: string;
  numberCorrectAnswer: number;
  totalQuestion: number;
}

interface StatisticsModule {
  moduleName: string;
  finalScore: number;
  domains: StatisticsDomain[];
}

interface StatisticsData {
  accountId: string;
  examId: string;
  startTime: string;
  endTime: string;
  progress: string;
  finalScore: number;
  modules: StatisticsModule[];
}

interface TestResultScreenProps {
  resultData: TestResultData;
  statisticsData?: StatisticsData;
  onReturnToTests?: () => void;
  onRetakeTest?: () => void;
  onDownloadReport?: () => void;
  onShareOnFacebook?: () => void;
}

// Trong RadarChart
const RadarChart: React.FC<{ data: any[], module: string }> = ({ data, module }) => {
  const size = 200;
  const center = size / 2;
  const radius = 70;

  const isValidData = data && Array.isArray(data) && data.length > 0 && data.every(skill => skill.percentage != null && !isNaN(skill.percentage));
  const isPlaceholderData = !isValidData || (data.length > 0 && data.every(skill => skill.total === 0));

  const getPoint = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / (isValidData ? data.length : 5) - Math.PI / 2;
    const distance = (isNaN(value) ? 0 : value / 100) * radius; // Fallback nếu value là NaN
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle)
    };
  };

  const createPath = () => {
    if (!isValidData) return `M ${center} ${center} Z`; // Fallback path
    return data.map((skill, index) => {
      const point = getPoint(index, skill.percentage);
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    }).join(' ') + ' Z';
  };

  const createGridLines = () => {
    const levels = [20, 40, 60, 80, 100];
    return levels.map(level => {
      const points = Array.from({ length: isValidData ? data.length : 5 }, (_, index) => getPoint(index, level));
      const path = points.map((point, index) =>
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
      ).join(' ') + ' Z';
      return (
        <path
          key={level}
          d={path}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
          opacity={0.3}
        />
      );
    });
  };

  return (
    <div className="flex flex-col items-center">
      <h4 className={`font-medium mb-3 ${isPlaceholderData ? 'text-gray-500' : 'text-gray-900'}`}>
        {module} Skills Performance
        {isPlaceholderData && (
          <span className="text-xs block text-gray-400 font-normal mt-1">
            No data available
          </span>
        )}
      </h4>
      <div className={`relative ${isPlaceholderData ? 'opacity-50' : ''}`}>
        <svg width={size} height={size} className="overflow-visible">
          {createGridLines()}
          {Array.from({ length: isValidData ? data.length : 5 }, (_, index) => {
            const point = getPoint(index, 100);
            return (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={point.x}
                y2={point.y}
                stroke="#d1d5db"
                strokeWidth="1"
                opacity={0.4}
              />
            );
          })}
          <path
            d={createPath()}
            fill={isPlaceholderData
              ? 'rgba(156, 163, 175, 0.2)'
              : module === 'Math' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)'
            }
            stroke={isPlaceholderData
              ? '#9ca3af'
              : module === 'Math' ? '#3b82f6' : '#10b981'
            }
            strokeWidth="2"
          />
          {isValidData && data.map((skill, index) => {
            const point = getPoint(index, skill.percentage);
            return (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={isPlaceholderData
                  ? '#9ca3af'
                  : module === 'Math' ? '#3b82f6' : '#10b981'
                }
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          {Array.from({ length: isValidData ? data.length : 5 }, (_, index) => {
            const labelPoint = getPoint(index, 110);
            const skill = isValidData ? data[index % data.length] : { name: 'N/A' };
            return (
              <text
                key={index}
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-gray-600 font-medium"
                style={{ fontSize: '10px' }}
              >
                {skill.name.length > 12 ? skill.name.substring(0, 12) + '...' : skill.name}
              </text>
            );
          })}
        </svg>
        <div className="mt-4 space-y-1">
          {isValidData && data.map((skill, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-gray-600">{skill.fullName}:</span>
              <span className="font-medium">{skill.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
const TestResultScreen: React.FC<TestResultScreenProps> = ({
  resultData,
  statisticsData,
  onReturnToTests,
  onRetakeTest,
  onDownloadReport,
  onShareOnFacebook,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionResult | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportQuestion, setReportQuestion] = useState<QuestionResult | null>(null);
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.remove('test-active');
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.height = 'auto';

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.height = '';
    };
  }, []);

  useEffect(() => {
    if (statisticsData) {
      console.log('Test statistics data:', statisticsData);
    }
  }, [statisticsData]);

  const totalQuestions = resultData.questionResults.length;
  const totalCorrect = resultData.questionResults.filter(q => q.isCorrect).length;
  const accuracy = Math.round((totalCorrect / totalQuestions) * 100);

  const readingWritingQuestions = resultData.questionResults.filter(q => q.module === 'Reading & Writing');
  const mathQuestions = resultData.questionResults.filter(q => q.module === 'Math');

  const getDomainDisplayName = (domainName: string) => {
    const domainMap: Record<string, string> = {
      'advanced math': 'AM',
      'geometry and trigonometry': 'GT',
      'problem solving and data analysis': 'PSDA',
      'algebra': 'ALG',
      'standard english conventions': 'SEC',
      'expression of ideas': 'EOI',
      'information and ideas': 'IAI',
      'craft and structure': 'CAS',
      'words in context': 'WIC',
      'text structure and purpose': 'TSP',
      'cross-text connections': 'CTC',
      'central ideas and details': 'CID',
      'command of textual evidence': 'CTE',
      'command of quantitative evidence': 'CQE',
      'inferences': 'INF',
      'form, structure, and sense': 'FSS',
      'boundaries': 'BND',
      'transitions': 'TRN',
      'rhetorical synthesis': 'RHS'
    };
    return domainMap[domainName.toLowerCase()] || domainName;
  };

  const getDomainFullName = (domainName: string) => {
    const domainMap: Record<string, string> = {
      'advanced math': 'Advanced Math',
      'geometry and trigonometry': 'Geometry & Trigonometry',
      'problem solving and data analysis': 'Problem Solving & Data Analysis',
      'algebra': 'Algebra',
      'standard english conventions': 'Standard English Conventions',
      'expression of ideas': 'Expression of Ideas',
      'information and ideas': 'Information and Ideas',
      'craft and structure': 'Craft and Structure',
      'words in context': 'Words in Context',
      'text structure and purpose': 'Text Structure and Purpose',
      'cross-text connections': 'Cross-Text Connections',
      'central ideas and details': 'Central Ideas and Details',
      'command of textual evidence': 'Command of Textual Evidence',
      'command of quantitative evidence': 'Command of Quantitative Evidence',
      'inferences': 'Inferences',
      'form, structure, and sense': 'Form, Structure, and Sense',
      'boundaries': 'Boundaries',
      'transitions': 'Transitions',
      'rhetorical synthesis': 'Rhetorical Synthesis'
    };
    return domainMap[domainName.toLowerCase()] || domainName;
  };

  const calculateSkillPerformanceFromStats = (moduleName: string) => {
    if (!statisticsData || !statisticsData.modules) {
      return calculateSkillPerformanceFromQuestions(moduleName);
    }

    const module = statisticsData.modules.find((m: StatisticsModule) => m.moduleName === moduleName);
    if (!module || !module.domains) {
      return getDefaultDomainsForModule(moduleName);
    }

    return module.domains.map((domain: StatisticsDomain) => ({
      name: getDomainDisplayName(domain.domainName),
      fullName: getDomainFullName(domain.domainName),
      percentage: Math.round((domain.numberCorrectAnswer / domain.totalQuestion) * 100),
      correct: domain.numberCorrectAnswer,
      total: domain.totalQuestion
    }));
  };

  const getDefaultDomainsForModule = (moduleName: string) => {
    if (moduleName === 'Math') {
      return [
        { name: 'ALG', fullName: 'Algebra', percentage: 0, correct: 0, total: 0 },
        { name: 'AM', fullName: 'Advanced Math', percentage: 0, correct: 0, total: 0 },
        { name: 'PSDA', fullName: 'Problem Solving & Data Analysis', percentage: 0, correct: 0, total: 0 },
        { name: 'GT', fullName: 'Geometry & Trigonometry', percentage: 0, correct: 0, total: 0 }
      ];
    } else if (moduleName === 'Reading & Writing') {
      return [
        { name: 'IAI', fullName: 'Information and Ideas', percentage: 0, correct: 0, total: 0 },
        { name: 'CAS', fullName: 'Craft and Structure', percentage: 0, correct: 0, total: 0 },
        { name: 'EOI', fullName: 'Expression of Ideas', percentage: 0, correct: 0, total: 0 },
        { name: 'SEC', fullName: 'Standard English Conventions', percentage: 0, correct: 0, total: 0 }
      ];
    }
    return [];
  };

  const calculateSkillPerformanceFromQuestions = (moduleName: string) => {
    const moduleQuestions = moduleName === 'Reading & Writing' ? readingWritingQuestions : mathQuestions;
    const skillGroups = moduleQuestions.reduce((acc, question) => {
      if (!acc[question.skill]) {
        acc[question.skill] = { correct: 0, total: 0 };
      }
      acc[question.skill].total++;
      if (question.isCorrect) {
        acc[question.skill].correct++;
      }
      return acc;
    }, {} as Record<string, { correct: number; total: number }>);

    return Object.entries(skillGroups).map(([skill, data]) => ({
      name: getDomainDisplayName(skill),
      fullName: getDomainFullName(skill),
      percentage: Math.round((data.correct / data.total) * 100),
      correct: data.correct,
      total: data.total
    }));
  };

  const ensureCompleteModuleScores = (moduleScores: ModuleScore[]): ModuleScore[] => {
    const requiredModules = ['Reading & Writing', 'Math'];
    const completeScores = [...moduleScores];

    requiredModules.forEach(moduleName => {
      const existingModule = completeScores.find(m => m.module === moduleName);
      if (!existingModule) {
        completeScores.push({
          module: moduleName as 'Reading & Writing' | 'Math',
          score: 200,
          maxScore: 800,
          percentile: 0,
          totalQuestions: 0,
          correctAnswers: 0
        });
      }
    });

    return completeScores;
  };

  const completeModuleScores = ensureCompleteModuleScores(resultData.moduleScores);
  const readingWritingSkills = calculateSkillPerformanceFromStats('Reading & Writing');
  const mathSkills = calculateSkillPerformanceFromStats('Math');

  const handleReturnToTests = () => {
    if (onReturnToTests) {
      onReturnToTests();
    } else {
      navigate('/tests');
    }
  };

  const handleRetakeTest = () => {
    if (onRetakeTest) {
      onRetakeTest();
    } else {
      navigate('/test/screen');
    }
  };
  const handleShareOnFacebook = async () => {
    if (!resultRef.current) {
      console.error('resultRef.current is null or undefined.');
      toast.error('Không thể tìm thấy nội dung để chia sẻ.');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Đợi nội dung tải nếu cần

      // Tạo clone của nội dung
      const clone = resultRef.current.cloneNode(true) as HTMLElement;
      document.body.appendChild(clone);

      // Xóa thẻ có id là needToRemove
      const elementToRemove = clone.querySelector('#needToRemove');
      if (elementToRemove) {
        elementToRemove.remove();
      }

      const options = {
        bgcolor: '#ffffff',
        style: {
          transform: 'scale(1)', // Tăng độ phân giải
        },
        filter: (node) => {
          // Bỏ qua iframe và các phần tử không mong muốn
          return !node.tagName || node.tagName.toLowerCase() !== 'iframe';
        },
      };

      const dataUrl = await domToImage.toPng(clone, options);
      document.body.removeChild(clone); // Xóa clone sau khi chụp
      console.log('Image Data URL:', dataUrl);
      if (!dataUrl || dataUrl === 'data:,') {
        throw new Error('Failed to generate image URL');
      }

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      console.log('Blob size:', blob.size); // Kiểm tra kích thước blob
      const formData = new FormData();
      formData.append('file', blob, 'screenshot.png');

      const uploadResponse = await axios.post('https://futureme.com.vn/api/v1/storage/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-one-time-uui': '6b1eeb8d-8d2f-4e8c-92c8-5d2f5276d3a6',
          'x-event-time': '2024-11-18T01:53:59+00:00'
        },
      });

      if (uploadResponse.data.result !== 'OK' || !uploadResponse.data.data) {
        throw new Error('Upload ảnh thất bại hoặc không nhận được URL.');
      }

      const publicImageUrl = uploadResponse.data.data;
      console.log('Public Image URL:', publicImageUrl);

      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicImageUrl)}`;
      window.open(shareUrl, '_blank', 'width=600,height=400');
      toast.success('Chia sẻ thành công!');
    } catch (error) {
      console.error('Error capturing or sharing screenshot:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Không thể tạo hoặc chia sẻ ảnh. Lỗi: ${errorMessage}`);
    }
  };

  const handleViewQuestionDetails = (question: QuestionResult) => {
    setSelectedQuestion(question);
    setIsQuestionModalOpen(true);
  };

  const handleCloseQuestionModal = () => {
    setIsQuestionModalOpen(false);
    setSelectedQuestion(null);
  };

  const handleReportQuestion = (question: QuestionResult) => {
    setReportQuestion(question);
    setReportDescription('');
    setIsReportModalOpen(true);
  };

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
    setReportQuestion(null);
    setReportDescription('');
    setIsSubmittingReport(false);
  };

  const handleSubmitReport = async () => {
    if (!reportQuestion || !reportDescription.trim()) {
      toast.error('Please enter a description for the report.');
      return;
    }

    setIsSubmittingReport(true);

    try {
      const response = await api.post('/id/ticket', {
        title: `Question with ID ${reportQuestion.questionId} has an error`,
        category: `SAT_${reportQuestion.questionId}`,
        description: reportDescription.trim(),
        attachments: []
      });

      if (response.status === 200 || response.status === 201) {
        toast.success('Report submitted successfully. Thank you for your feedback!');
        handleCloseReportModal();
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again later.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'text-green-600';
    if (percentile >= 70) return 'text-blue-600';
    if (percentile >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getModuleTranslationKey = (module: string) => {
    if (module === 'Reading & Writing') {
      return 'Reading & Writing';
    }
    return module;
  };

  const getSkillDisplayName = (skill: string) => {
    const skillMap: Record<string, string> = {
      'advanced math': 'Advanced Math',
      'geometry and trigonometry': 'Geometry and Trigonometry',
      'problem solving and data analysis': 'Problem-Solving and Data Analysis',
      'algebra': 'Algebra',
      'standard english conventions': 'Standard English Conventions',
      'expression of ideas': 'Expression of Ideas',
      'information and ideas': 'Information and Ideas',
      'craft and structure': 'Craft and Structure'
    };
    return skillMap[skill.toLowerCase()] || skill;
  };

  const getQuestionTypeDisplayName = (question: QuestionResult) => {
    const questionType = question.originalData?.questionType;

    if (questionType === 'RADIO') {
      return 'Single Choice';
    } else if (questionType === 'TEXT') {
      return 'Short Answer';
    }

    return question.topic.charAt(0).toUpperCase() + question.topic.slice(1).toLowerCase();
  };

  const QuestionResultRow: React.FC<{ question: QuestionResult; index: number }> = ({ question, index }) => (
    <tr className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
      <td className="px-4 py-3 text-sm font-medium text-center">{question.questionNumber}</td>
      <td className="px-4 py-3 text-sm text-gray-700 text-center">{getQuestionTypeDisplayName(question)}</td>
      <td className="px-4 py-3 text-center">
        <Badge
          className={
            question.difficulty === 'Easy'
              ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-200'
              : question.difficulty === 'Medium'
                ? 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-800 hover:border-yellow-200'
                : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100 hover:text-red-800 hover:border-red-200'
          }
        >
          {question.difficulty}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 text-center">{question.userAnswer || 'No Answer'}</td>
      <td className="px-4 py-3 text-sm text-gray-700 text-center max-w-32">
        <div
          className="truncate whitespace-nowrap overflow-hidden text-ellipsis"
          title={question.correctAnswer}
          style={{ maxWidth: '128px' }}
        >
          {question.module === 'Math' ? (
            <div className="inline-block max-w-full truncate">
              <LatexRenderer content={question.correctAnswer} />
            </div>
          ) : (
            question.correctAnswer
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center">
          {question.isCorrect ? (
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewQuestionDetails(question)}
            className="text-xs text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <Eye className="w-3 h-3 mr-1" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleReportQuestion(question)}
            className="text-xs text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
          </Button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with centered title */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6" ref={resultRef}>
          {/* Navigation and Actions */}
          <div className="flex items-center justify-between mb-6" id='needToRemove'>
            <Button variant="ghost" onClick={handleReturnToTests}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tests
            </Button>
            <div className="flex gap-3">
              <Button onClick={handleRetakeTest}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Test
              </Button>

              <Button
                onClick={handleShareOnFacebook}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Share on Facebook
              </Button>
            </div>
          </div>

          {/* Centered Title Section */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{resultData.testName}</h1>
            <div className="flex items-center justify-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{resultData.testDate}</span>
              </div>
            </div>
          </div>

          {/* [XÁC NHẬN] Sử dụng ref để chụp toàn bộ nội dung kết quả */}
          <div>
            {/* Overall Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{resultData.totalScore}</div>
                  <div className="text-sm text-gray-600">Total Score</div>
                  <div className="text-xs text-gray-500">out of {resultData.maxTotalScore}</div>
                  {completeModuleScores.some(m => m.totalQuestions === 0) && (
                    <div className="mt-2 text-xs text-gray-600">
                      {completeModuleScores.map(module => (
                        <div key={module.module} className="flex justify-between">
                          <span className={module.totalQuestions === 0 ? 'opacity-60' : ''}>
                            {getModuleTranslationKey(module.module)}:
                          </span>
                          <span className={module.totalQuestions === 0 ? 'opacity-60' : ''}>{module.score}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{accuracy}%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                  <div className="text-xs text-gray-500">{totalCorrect} out of {totalQuestions}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">{resultData.totalTime}</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                  <div className="text-xs text-gray-500">Total Time</div>
                </CardContent>
              </Card>
            </div>

            {/* Module Scores */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 mt-6">
              {completeModuleScores.map((moduleScore, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span>{getModuleTranslationKey(moduleScore.module)}</span>
                      <div className="flex gap-2">
                        {moduleScore.totalQuestions === 0 && (
                          <Badge variant="secondary" className="text-xs hover:bg-gray-100 hover:text-gray-800">
                            Not Taken
                          </Badge>
                        )}
                        <Badge variant="outline" className="ml-2 hover:bg-white hover:text-gray-900 hover:border-gray-200">
                          {moduleScore.correctAnswers}/{moduleScore.totalQuestions}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`space-y-3 ${moduleScore.totalQuestions === 0 ? 'opacity-60' : ''}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Score</span>
                        <span className={`text-2xl font-bold ${moduleScore.totalQuestions === 0 ? 'text-gray-400' : getScoreColor(moduleScore.score, moduleScore.maxScore)}`}>
                          {moduleScore.score}/{moduleScore.maxScore}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Percentile</span>
                        <span className={`text-lg font-semibold ${moduleScore.totalQuestions === 0 ? 'text-gray-400' : getPercentileColor(moduleScore.percentile)}`}>
                          {moduleScore.percentile}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${moduleScore.totalQuestions === 0 ? 'bg-gray-400' : 'bg-blue-600'}`}
                          style={{ width: `${(moduleScore.score / moduleScore.maxScore) * 100}%` }}
                        ></div>
                      </div>
                      {moduleScore.totalQuestions === 0 && (
                        <div className="text-center text-sm text-gray-500 italic mt-2">
                          This module was not included in the test
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="border-b">
                <nav className="flex space-x-8 px-6 justify-center">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('detailed')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'detailed'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Detailed Results
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Skills Performance</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="border rounded-lg p-6">
                          <RadarChart data={readingWritingSkills} module="Reading & Writing" />
                        </div>
                        <div className="border rounded-lg p-6">
                          <RadarChart data={mathSkills} module="Math" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'detailed' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Reading & Writing</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100 border-b">
                              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Question #</th>
                              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Type</th>
                              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Difficulty</th>
                              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Your Answer</th>
                              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Correct Answer</th>
                              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Result</th>
                              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {readingWritingQuestions.length > 0 ? (
                              readingWritingQuestions.map((question, index) => (
                                <QuestionResultRow key={question.questionId} question={question} index={index} />
                              ))
                            ) : (
                              <tr className="border-b">
                                <td colSpan={7} className="px-4 py-12 text-center">
                                  <div className="flex flex-col items-center justify-center space-y-3 text-gray-500">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-lg font-medium text-gray-600 mb-1">No Reading & Writing Questions Available</p>
                                      <p className="text-sm text-gray-500">This module was not included in the test</p>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Math</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100 border-b">
                              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Question #</th>
                              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Type</th>
                              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Difficulty</th>
                              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Your Answer</th>
                              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Correct Answer</th>
                              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Result</th>
                              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mathQuestions.length > 0 ? (
                              mathQuestions.map((question, index) => (
                                <QuestionResultRow key={question.questionId} question={question} index={index} />
                              ))
                            ) : (
                              <tr className="border-b">
                                <td colSpan={7} className="px-4 py-12 text-center">
                                  <div className="flex flex-col items-center justify-center space-y-3 text-gray-500">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-lg font-medium text-gray-600 mb-1">No Math Questions Available</p>
                                      <p className="text-sm text-gray-500">This module was not included in the test</p>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isQuestionModalOpen}
        onClose={handleCloseQuestionModal}
        maxWidth="max-w-6xl"
        title={`Question ${selectedQuestion?.questionNumber}`}
      >
        {selectedQuestion && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Module:</span>
                  <div className="font-semibold">{selectedQuestion.module}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Domain:</span>
                  <div className="font-semibold">{selectedQuestion.originalData?.questionDomain || selectedQuestion.skill}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Skill:</span>
                  <div className="font-semibold">{getSkillDisplayName(selectedQuestion.skill)}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Difficulty:</span>
                  <div>
                    <Badge
                      className={
                        selectedQuestion.difficulty === 'Easy'
                          ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-200'
                          : selectedQuestion.difficulty === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-800 hover:border-yellow-200'
                            : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100 hover:text-red-800 hover:border-red-200'
                      }
                    >
                      {selectedQuestion.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Question Content</h4>
                <div className="bg-white border rounded-lg p-6">
                  {selectedQuestion.originalData?.questionContent ? (
                    <div className="space-y-4">
                      <div className="prose max-w-none text-left">
                        {renderTextContent(
                          selectedQuestion.originalData.questionContent,
                          selectedQuestion.module === 'Math'
                        )}
                      </div>
                      {selectedQuestion.originalData.questionImage && (
                        <div className="mt-4">
                          <img
                            src={selectedQuestion.originalData.questionImage}
                            alt="Question image"
                            className="max-w-full h-auto rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600 italic text-left">
                      Question content not available
                    </p>
                  )}
                  <div className="mt-4 text-sm text-gray-500">
                    <p><strong>Question ID:</strong> {selectedQuestion.questionId}</p>
                    <p><strong>Type:</strong> {
                      selectedQuestion.originalData?.questionType === 'RADIO' ? 'Single choice' :
                        selectedQuestion.originalData?.questionType === 'TEXT' ? 'Text input' :
                          selectedQuestion.originalData?.questionType || 'Unknown'
                    }</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Answer Choices</h4>
                <div className="space-y-2">
                  {selectedQuestion.originalData?.answers && selectedQuestion.originalData.answers.length > 0 ? (
                    selectedQuestion.originalData.answers.map((answer, index) => {
                      const isCorrect = answer.isCorrect;
                      const isSelected = selectedQuestion.originalData?.chosenAnswers.some(
                        chosen => chosen.value === answer.value
                      );

                      return (
                        <div
                          key={answer.questionOptionId}
                          className={`border rounded-lg p-4 ${isCorrect && isSelected
                            ? 'bg-green-50 border-green-500'
                            : isCorrect
                              ? 'bg-green-50 border-green-300'
                              : isSelected
                                ? 'bg-red-50 border-red-300'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <span className="font-medium text-lg flex-shrink-0">{String.fromCharCode(65 + index)}.</span>
                              <div className="prose max-w-none flex-1 text-left">
                                {renderTextContent(answer.value, selectedQuestion.module === 'Math')}
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1 ml-4">
                              {isCorrect && (
                                <Badge variant="default" className="bg-green-600 hover:bg-green-600 hover:text-white">
                                  Correct Answer
                                </Badge>
                              )}
                              {isSelected && (
                                <Badge variant={isCorrect ? "default" : "destructive"} className={isCorrect ? "bg-blue-600 hover:bg-blue-600 hover:text-white" : "hover:bg-red-600 hover:text-white"}>
                                  Your Answer
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="space-y-2">
                      <div className="border rounded-lg p-4 bg-gray-50 border-gray-200">
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-sm text-gray-600 block text-center">Your Answer:</span>
                            <div className="mt-1 p-2 bg-white border rounded text-left">
                              {renderTextContent(selectedQuestion.userAnswer || 'No answer provided', selectedQuestion.module === 'Math')}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-sm text-gray-600 block text-center">Correct Answer:</span>
                            <div className="mt-1 p-2 bg-green-50 border border-green-200 rounded text-left">
                              {renderTextContent(selectedQuestion.correctAnswer, selectedQuestion.module === 'Math')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {selectedQuestion.isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  <span className={`font-semibold ${selectedQuestion.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {selectedQuestion.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
              </div>
              {!selectedQuestion.isCorrect && (
                <div className="mt-3 text-sm text-gray-600 text-left">
                  <p><strong>Your answer:</strong> {renderTextContent(selectedQuestion.userAnswer || 'No answer selected', selectedQuestion.module === 'Math')}</p>
                  <p><strong>Correct answer:</strong> {renderTextContent(selectedQuestion.correctAnswer, selectedQuestion.module === 'Math')}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isReportModalOpen}
        onClose={handleCloseReportModal}
        maxWidth="max-w-2xl"
        title={`Report Error - Question ${reportQuestion?.questionNumber}`}
      >
        {reportQuestion && (
          <div className="space-y-4">
            <div>
              <label htmlFor="reportDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Describe the issue with this question: *
              </label>
              <textarea
                id="reportDescription"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Please describe the issue you found with this question..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-vertical"
                disabled={isSubmittingReport}
              />
              {!reportDescription.trim() && (
                <p className="text-sm text-gray-500 mt-1">
                  This field is required to submit the report.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCloseReportModal}
                disabled={isSubmittingReport}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReport}
                disabled={isSubmittingReport || !reportDescription.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmittingReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TestResultScreen;