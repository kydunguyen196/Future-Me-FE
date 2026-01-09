import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/redux/hooks';
import {
  FileText,
  Clock,
  Award,
  TrendingUp,
  Calendar,
  Eye,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Pagination, { type ItemPerPage } from '@/components/Pagination';
import api from '@/lib/axios';

// Types for test data
interface TestHistoryItem {
  testId: string;
  testName: string;
  subject: string;
  score: number;
  maxScore: number;
  completedAt: string;
  status: 'passed' | 'failed' | 'pending' | 'in-progress';
  timeSpent: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  percentile?: number;
}

// Types for API response from exam history
interface ExamHistoryItem {
  examId: string;
  accountId: string;
  startTime: string;
  endTime: string;
  progress: string;
  finalScore: number;
  modules?: any[];
}

interface ApiResponse {
  result: string;
  correlationId: string;
  data: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    items: ExamHistoryItem[];
  };
}

const TestHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  // Check if user is a student, if not redirect or show unauthorized
  if (!user || user.role?.toLowerCase() !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Access Restricted
          </h3>
          <p className="text-gray-600 mb-6">
            Test history is only available for students.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
  
  // State management
  const [tests, setTests] = useState<TestHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<ItemPerPage>('20');
  const [totalTests, setTotalTests] = useState(0);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');



  // Fetch test history data
  const fetchTestHistory = async (page: number, ipp: ItemPerPage) => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is available
      if (!user?.accountId) {
        throw new Error('User account not found');
      }

      // Try to fetch from API first
      try {
        // Map sort by to API expected format
        const apiSortBy = sortBy === 'recent' ? 'createdAt' : 
                         sortBy === 'oldest' ? 'createdAt' :
                         sortBy === 'score-high' ? 'totalScore' :
                         sortBy === 'score-low' ? 'totalScore' : 'createdAt';
        
        const orderType = sortBy === 'recent' ? 'DESC' :
                         sortBy === 'oldest' ? 'ASC' :
                         sortBy === 'score-high' ? 'DESC' :
                         sortBy === 'score-low' ? 'ASC' : 'DESC';

        const params = {
          accountId: user.accountId,
          pageNumber: page, // API uses 1-based indexing
          pageSize: parseInt(ipp),
          sortBy: apiSortBy,
          orderType: orderType
        };

        const response = await api.get<ApiResponse>('/sat/exam/get-history-exams', { params });
        
        if (response.data.result === 'OK' && response.data.data) {
          const apiItems = response.data.data.items || [];
          
          // Check if we have actual data or empty response
          if (apiItems.length === 0) {
            console.log('No test history found from API');
            setTests([]);
            setTotalTests(0);
            return;
          } else {
            // Transform API response to TestHistoryItem format
            let exams: TestHistoryItem[] = apiItems.map((exam: ExamHistoryItem) => {
              // Calculate time spent in minutes
              const startTime = new Date(exam.startTime);
              const endTime = new Date(exam.endTime);
              const timeSpent = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
              
              // Determine status based on progress and score
              let status: TestHistoryItem['status'] = 'pending';
              if (exam.progress === 'End' || exam.progress === 'COMPLETED') {
                status = exam.finalScore >= 600 ? 'passed' : 'failed'; // Assuming 600+ is passing
              } else if (exam.progress === 'IN_PROGRESS') {
                status = 'in-progress';
              }

              // Calculate percentile for passed tests (mock calculation)
              const percentile = status === 'passed' ? Math.floor((exam.finalScore / 1600) * 100) : undefined;

              return {
                testId: exam.examId,
                testName: `SAT Practice Test`,
                subject: 'Full Test',
                score: exam.finalScore || 0,
                maxScore: 1600,
                completedAt: exam.endTime || exam.startTime,
                status,
                timeSpent: Math.max(timeSpent, 30), // Minimum 30 minutes
                difficulty: exam.finalScore >= 1200 ? 'hard' : exam.finalScore >= 800 ? 'medium' : 'easy',
                percentile
              };
            });
            
            // Apply client-side filtering for search and status/subject filters
            if (searchTerm || statusFilter !== 'all' || subjectFilter !== 'all') {
              exams = exams.filter(exam => {
                const matchesSearch = !searchTerm || 
                  exam.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
                const matchesSubject = subjectFilter === 'all' || exam.subject === subjectFilter;
                
                return matchesSearch && matchesStatus && matchesSubject;
              });
            }

            setTests(exams);
            setTotalTests(response.data.data.totalItems);
            console.log('Fetched test history from API:', exams);
            return;
          }
        }
              } catch (apiError) {
        console.warn('API call failed:', apiError);
        setTests([]);
        setTotalTests(0);
        return;
      }
      
    } catch (err) {
      console.error('Error fetching test history:', err);
      setError('Failed to load test history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination change
  const handlePaginationChange = (page: number, ipp: ItemPerPage) => {
    setCurrentPage(page);
    setItemsPerPage(ipp);
  };

  // Handle view results
  const handleViewResults = (testId: string) => {
    navigate(`/test-results/${testId}`);
  };

  // Handle retake test
  const handleRetakeTest = (testId: string) => {
    navigate('/test/screen', { state: { retakeFromTest: testId } });
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const calculatePercentage = (score: number, maxScore: number) => {
    return Math.round((score / maxScore) * 100);
  };

  const getStatusBadge = (status: TestHistoryItem['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100 hover:text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 hover:text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100 hover:text-gray-800';
    }
  };

  const getStatusIcon = (status: TestHistoryItem['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getDifficultyBadge = (difficulty: TestHistoryItem['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'hard':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Effects
  useEffect(() => {
    fetchTestHistory(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, subjectFilter, sortBy]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, subjectFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Award className="w-8 h-8 text-blue-600" />
                  Test History
                </h1>
                <p className="text-gray-600 mt-2">
                  View and track all your test performance and results
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => navigate('/test/screen')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Take New Test
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Tests
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search by name or subject..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="passed">Passed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      <SelectItem value="Full Test">Full Test</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Reading">Reading</SelectItem>
                      <SelectItem value="Writing">Writing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="score-high">Highest Score</SelectItem>
                      <SelectItem value="score-low">Lowest Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setSubjectFilter('all');
                      setSortBy('recent');
                    }}
                    className="w-full"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Count */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <p className="text-sm text-gray-600">
              Showing {tests.length} of {totalTests} tests
            </p>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {[...Array(5)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                          <div className="flex items-center gap-4">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                          <div className="h-6 bg-gray-200 rounded-full w-12"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 bg-gray-200 rounded"></div>
                            <div>
                              <div className="h-5 bg-gray-200 rounded w-16 mb-1"></div>
                              <div className="h-3 bg-gray-200 rounded w-8"></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 bg-gray-200 rounded"></div>
                            <div>
                              <div className="h-5 bg-gray-200 rounded w-12 mb-1"></div>
                              <div className="h-3 bg-gray-200 rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-8 bg-gray-200 rounded w-24"></div>
                          <div className="h-8 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
          >
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Tests</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={() => fetchTestHistory(currentPage, itemsPerPage)}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Try Again
            </Button>
          </motion.div>
        )}

        {/* Test List */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {tests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Tests Found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm || statusFilter !== 'all' || subjectFilter !== 'all'
                      ? 'Try adjusting your filters to see more results.'
                      : 'You haven\'t taken any tests yet.'}
                  </p>
                  <Button
                    onClick={() => navigate('/test/screen')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Take Your First Test
                  </Button>
                </CardContent>
              </Card>
            ) : (
              tests.map((test, index) => (
                <motion.div
                  key={test.testId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        {/* Test Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {test.testName}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  {test.subject}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(test.completedAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatDuration(test.timeSpent)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge className={`${getStatusBadge(test.status)}`}>
                                {getStatusIcon(test.status)}
                                <span className="ml-1 capitalize">{test.status}</span>
                              </Badge>
                              <Badge className={`${getDifficultyBadge(test.difficulty)}`}>
                                {test.difficulty}
                              </Badge>
                            </div>
                          </div>

                          {/* Score and Stats */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              {/* Score */}
                              <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-blue-600" />
                                <div>
                                  <div className="text-lg font-bold text-gray-900">
                                    {test.score}/{test.maxScore}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {calculatePercentage(test.score, test.maxScore)}%
                                  </div>
                                </div>
                              </div>

                              {/* Percentile */}
                              {test.percentile && (
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="w-5 h-5 text-green-600" />
                                  <div>
                                    <div className="text-lg font-bold text-gray-900">
                                      {test.percentile}th
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Percentile
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => handleViewResults(test.testId)}
                                variant="outline"
                                size="sm"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Results
                              </Button>
                              {test.status !== 'in-progress' && (
                                <Button
                                  onClick={() => handleRetakeTest(test.testId)}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  Retake
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && !error && totalTests > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex justify-center"
          >
            <Pagination
              page={currentPage}
              ipp={itemsPerPage}
              total={totalTests}
              handle={handlePaginationChange}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TestHistoryPage; 