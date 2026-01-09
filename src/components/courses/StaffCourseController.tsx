import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Users,
  GraduationCap
} from 'lucide-react';

import { 
  type Course,
  type CourseFormData,
  COURSE_LEVELS,
  COURSE_STATUSES
} from './CourseModels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ManagementPageSkeleton } from '@/components/ui/ManagementPageSkeleton';
import { toast } from 'react-toastify';
import api from '@/lib/axios';

interface StaffCourseControllerProps {
  className?: string;
}

export function StaffCourseController({ className }: StaffCourseControllerProps) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isApplyTutorDialogOpen, setIsApplyTutorDialogOpen] = useState(false);
  const [availableTutors, setAvailableTutors] = useState<any[]>([]);
  const [selectedTutors, setSelectedTutors] = useState<string[]>([]);

  const [formData, setFormData] = useState<CourseFormData>({
    course_name: '',
    subject: '',
    course_level: 'Beginner',
    description: '',
    short_description: '',
    introduction_video: '',
    price: 0,
    duration_weeks: 1,
    max_students: 10,
    tag: '',
    tutor_id: '',
    status: 'Draft'
  });
  const [sessionDuration, setSessionDuration] = useState<number>(45); // Default 45 minutes
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]); // Track selected time slots
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  // Helper function to map API response to Course interface
  const mapApiResponseToCourse = (apiCourse: any): Course => {
    // Map the first tutor if available, or undefined
    const tutor = apiCourse.tutors && apiCourse.tutors.length > 0 ? {
      tutor_id: apiCourse.tutors[0].accountId || '',
      account_id: apiCourse.tutors[0].accountId || '',
      firstName: apiCourse.tutors[0].firstName || '',
      lastName: apiCourse.tutors[0].lastName || '',
      email: apiCourse.tutors[0].email || '',
      avatar: apiCourse.tutors[0].avatar || '',
      major: apiCourse.tutors[0].major || '',
      rating: apiCourse.tutors[0].rating || 0,
    } : undefined;

    return {
      course_id: apiCourse.courseId || '',
      tutor_id: tutor?.tutor_id || '',
      course_name: apiCourse.courseName || '',
      introduction_video: apiCourse.introduction_video || '',
      subject: apiCourse.subject || '',
      price: apiCourse.price || 0,
      course_level: apiCourse.courseLevel || 'Beginner',
      tag: apiCourse.tag || '',
      description: apiCourse.description || '',
      short_description: apiCourse.short_description || apiCourse.description || '',
      duration_weeks: apiCourse.duration_weeks || 1,
      max_students: apiCourse.max_students || 10,
      current_students: apiCourse.current_students || 0,
      status: apiCourse.status || 'Draft',
      created_at: apiCourse.createdAt || '',
      updated_at: apiCourse.updatedAt || '',
      deleted: apiCourse.deleted || false,
      tutor,
    };
  };

  const loadCourses = async (filters = {}) => {
    try {
      setIsLoading(true);
      // Use the correct API endpoint to get all courses
      const response = await api.get('/tms/manage/course', {
        params: filters
      });
      
      if (response.data?.result === 'OK' && Array.isArray(response.data.data.items)) {
        // Map API response to Course interface
        const mappedCourses = response.data.data.items.map(mapApiResponseToCourse);
        setCourses(mappedCourses);
      } else if (response.data?.result === 'OK' && Array.isArray(response.data.data)) {
        // Map API response to Course interface
        const mappedCourses = response.data.data.map(mapApiResponseToCourse);
        setCourses(mappedCourses);
      } else {
        // Fallback to local data for development
        const { default: courseData } = await import('@/data/courses.json');
        setCourses(courseData as Course[]);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
      // Fallback to local data
      try {
        const { default: courseData } = await import('@/data/courses.json');
        setCourses(courseData as Course[]);
      } catch (fallbackError) {
        console.error('Failed to load fallback course data:', fallbackError);
        toast.error('Failed to load courses');
        setCourses([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCourse = (course: Course) => {
    navigate(`/staff/courses/${course.course_id}`);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      course_name: course.course_name,
      subject: course.subject,
      course_level: course.course_level,
      description: course.description || '',
      short_description: course.short_description || '',
      introduction_video: course.introduction_video,
      price: course.price || 0,
      duration_weeks: course.duration_weeks,
      max_students: course.max_students,
      tag: course.tag,
      tutor_id: course.tutor_id,
      status: course.status as any
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const handleScheduleCourse = (course: Course) => {
    setSelectedCourse(course);
    // Reset selection state
    setSelectedTimeSlots([]);
    setIsScheduleDialogOpen(true);
  };

  const handleApplyTutorToCourse = (course: Course) => {
    setSelectedCourse(course);
    setSelectedTutors([]);
    loadAvailableTutors();
    setIsApplyTutorDialogOpen(true);
  };

  const loadAvailableTutors = async () => {
    try {
      const response = await api.get('/id/account/tutors');
      if (response.data?.result === 'OK' && Array.isArray(response.data.data)) {
        setAvailableTutors(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load tutors:', error);
      toast.error('Failed to load available tutors');
    }
  };

  const resetForm = () => {
    setFormData({
      course_name: '',
      subject: '',
      course_level: 'Beginner',
      description: '',
      short_description: '',
      introduction_video: '',
      price: 0,
      duration_weeks: 1,
      max_students: 10,
      tag: '',
      tutor_id: '',
      status: 'Draft'
    });
  };

  const handleCreateCourse = async () => {
    // Validate required fields
    if (!formData.course_name.trim() || !formData.subject.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data for API call with correct field names
      const submitData = {
        courseName: formData.course_name.trim(),
        description: formData.description.trim(),
        subject: formData.subject.trim(),
        courseLevel: formData.course_level
      };
      
      const response = await api.post('/tms/manage/course', submitData);
      
      if (response.data?.result === 'OK') {
        await loadCourses();
        setIsCreateDialogOpen(false);
        resetForm();
        toast.success('Course created successfully');
      } else {
        throw new Error('Failed to create course');
      }
    } catch (error) {
      console.error('Failed to create course:', error);
      toast.error('Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return;

    // Validate required fields
    if (!formData.course_name.trim() || !formData.subject.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Prepare data for API call with correct field names
      const submitData = {
        courseId: selectedCourse.course_id,
        courseName: formData.course_name.trim(),
        description: formData.description.trim(),
        subject: formData.subject.trim(),
        courseLevel: formData.course_level
      };
      
      const response = await api.put('/tms/manage/course', submitData);
      
      if (response.data?.result === 'OK') {
        await loadCourses();
        setIsEditDialogOpen(false);
        setSelectedCourse(null);
        resetForm();
        toast.success('Course updated successfully');
      } else {
        throw new Error('Failed to update course');
      }
    } catch (error) {
      console.error('Failed to update course:', error);
      toast.error('Failed to update course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyTutors = async () => {
    if (!selectedCourse || selectedTutors.length === 0) {
      toast.error('Please select at least one tutor');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await api.post(`/tms/manage/course/${selectedCourse.course_id}/apply`, {
        tutors: selectedTutors
      });
      
      if (response.data?.result === 'OK') {
        await loadCourses();
        setIsApplyTutorDialogOpen(false);
        setSelectedCourse(null);
        setSelectedTutors([]);
        toast.success('Tutors applied to course successfully');
      } else {
        throw new Error('Failed to apply tutors to course');
      }
    } catch (error) {
      console.error('Failed to apply tutors to course:', error);
      toast.error('Failed to apply tutors to course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    
    setIsSubmitting(true);
    try {
      const response = await api.delete(`/tms/manage/course/${selectedCourse.course_id}/delete`);
      
      if (response.data?.result === 'OK') {
        await loadCourses();
        setIsDeleteDialogOpen(false);
        setSelectedCourse(null);
        toast.success('Course deleted successfully');
      } else {
        throw new Error('Failed to delete course');
      }
    } catch (error) {
      console.error('Failed to delete course:', error);
      toast.error('Failed to delete course');
    } finally {
      setIsSubmitting(false);
    }
  };



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Helper function to generate time slot ID
  const getTimeSlotId = (timeIndex: number, dayIndex: number) => {
    return `${timeIndex}-${dayIndex}`;
  };

  // Helper function to calculate slots needed for session duration
  const getSlotsNeeded = (duration: number) => {
    return Math.ceil(duration / 30); // Each slot is 30 minutes
  };

  // Helper function to get consecutive available slots
  const getConsecutiveSlots = (startTimeIndex: number, dayIndex: number, slotsNeeded: number) => {
    const slots = [];
    for (let i = 0; i < slotsNeeded; i++) {
      const timeIndex = startTimeIndex + i;
      if (timeIndex >= 28) break; // Don't exceed available time slots
      slots.push(getTimeSlotId(timeIndex, dayIndex));
    }
    return slots;
  };

  // Handle time slot selection
  const handleTimeSlotClick = (timeIndex: number, dayIndex: number, isAvailable: boolean) => {
    if (!isAvailable) return;

    const slotId = getTimeSlotId(timeIndex, dayIndex);
    const slotsNeeded = getSlotsNeeded(sessionDuration);
    const consecutiveSlots = getConsecutiveSlots(timeIndex, dayIndex, slotsNeeded);

    // Check if we can fit the full session duration
    if (consecutiveSlots.length < slotsNeeded) {
      toast.warning(`Not enough consecutive time slots for ${sessionDuration} minute session`);
      return;
    }

    // Check if all consecutive slots are available
    const allAvailable = consecutiveSlots.every(() => {
      // Mock availability check - in real app this would check actual availability
      return Math.random() > 0.3;
    });

    if (!allAvailable) {
      toast.warning('Some time slots in this range are not available');
      return;
    }

    // Toggle selection
    if (selectedTimeSlots.includes(slotId)) {
      // Deselect
      setSelectedTimeSlots([]);
    } else {
      // Select new range
      setSelectedTimeSlots(consecutiveSlots);
    }
  };

  // Check if a slot is part of a selected range
  const isSlotInSelectedRange = (timeIndex: number, dayIndex: number) => {
    const slotId = getTimeSlotId(timeIndex, dayIndex);
    return selectedTimeSlots.includes(slotId);
  };

  const getStatusBadge = (status: string) => {
    const config = COURSE_STATUSES.find(s => s.value === status);
    if (!config) return <Badge>{status}</Badge>;
    
    const colorClass = {
      green: 'bg-green-100 text-green-800 border-green-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200'
    }[config.color] || 'bg-gray-100 text-gray-800 border-gray-200';
    
    return <Badge className={colorClass}>{config.label}</Badge>;
  };

  const filteredCourses = courses.filter(course => {
    if (!course) return false;
    
    // Safely handle potential undefined values
    const courseName = course.course_name?.toLowerCase() || '';
    const subject = course.subject?.toLowerCase() || '';
    const tutorFirstName = course.tutor?.firstName?.toLowerCase() || '';
    const tutorLastName = course.tutor?.lastName?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = courseName.includes(searchLower) ||
                         subject.includes(searchLower) ||
                         tutorFirstName.includes(searchLower) ||
                         tutorLastName.includes(searchLower);
    
    const matchesStatus = statusFilter === 'ALL' || course.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statsData = {
    total: courses.length,
    active: courses.filter(c => c.status === 'Active').length,
    draft: courses.filter(c => c.status === 'Draft').length,
    completed: courses.filter(c => c.status === 'Completed').length,
  };

  if (isLoading) {
    return <ManagementPageSkeleton type="courses" />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold">Course Management</CardTitle>
                <CardDescription className="text-lg">
                  Manage courses, assign tutors, and schedule sessions
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={() => {
                resetForm();
                setIsCreateDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{statsData.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active</p>
                <p className="text-2xl font-bold text-green-700">{statsData.active}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Draft</p>
                <p className="text-2xl font-bold text-yellow-700">{statsData.draft}</p>
              </div>
              <BookOpen className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Completed</p>
                <p className="text-2xl font-bold text-blue-700">{statsData.completed}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course List Content */}
      <div className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search courses by name, subject, or tutor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    {COURSE_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.course_id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold line-clamp-2 mb-2">
                          {course.course_name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {course.short_description}
                        </p>
                      </div>
                      {getStatusBadge(course.status)}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Subject:</span>
                        <span className="font-medium">{course.subject}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Level:</span>
                        <span className="font-medium">{course.course_level}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{course.duration_weeks} weeks</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Students:</span>
                        <span className="font-medium">
                          {course.current_students}/{course.max_students}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewCourse(course)}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-2 mr-1" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCourse(course)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-2 mr-1" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApplyTutorToCourse(course)}
                        title="Apply Tutors"
                      >
                        <Users className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleScheduleCourse(course)}
                      >
                        <Calendar className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteCourseClick(course)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'ALL' 
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first course'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>

      {/* Create/Edit Course Modal */}
      <Modal
        isOpen={isCreateDialogOpen || isEditDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }}
        title={isCreateDialogOpen ? "Create New Course" : "Edit Course"}
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Required fields for API */}
          <div>
            <label className="text-sm font-medium text-gray-700">Course Name *</label>
            <Input
              value={formData.course_name}
              onChange={(e) => setFormData(prev => ({ ...prev, course_name: e.target.value }))}
              placeholder="Enter course name"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Subject *</label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter subject"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Course Level *</label>
            <Select value={formData.course_level} onValueChange={(value) => setFormData(prev => ({ ...prev, course_level: value as any }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COURSE_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter course description"
              rows={4}
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={isCreateDialogOpen ? handleCreateCourse : handleUpdateCourse}
            disabled={isSubmitting || !formData.course_name.trim() || !formData.subject.trim() || !formData.description.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Saving...' : (isCreateDialogOpen ? 'Create Course' : 'Update Course')}
          </Button>
        </div>
      </Modal>

      {/* Schedule Modal */}
      <Modal
        isOpen={isScheduleDialogOpen}
        onClose={() => setIsScheduleDialogOpen(false)}
        title="Schedule your lessons"
        maxWidth="max-w-7xl"
      >
        {selectedCourse && (
          <div className="space-y-6 max-w-6xl mx-auto w-full">
            {/* Course Info */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedCourse.tutor?.avatar} />
                <AvatarFallback>
                  {selectedCourse.tutor?.firstName[0]}{selectedCourse.tutor?.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{selectedCourse.course_name}</h3>
                <p className="text-sm text-gray-600">{selectedCourse.duration_weeks} weeks • {selectedCourse.subject}</p>
                <p className="text-sm text-gray-500">{sessionDuration} mins</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-lg font-bold text-green-600 text-left">{formatCurrency(selectedCourse.price || 0)}</p>
              </div>
            </div>

            {/* Session Duration & Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Session Duration Selector */}
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-700">Session Duration:</label>
                  <Select value={sessionDuration.toString()} onValueChange={(value) => setSessionDuration(Number(value))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 mins</SelectItem>
                      <SelectItem value="35">35 mins</SelectItem>
                      <SelectItem value="45">45 mins</SelectItem>
                      <SelectItem value="60">60 mins</SelectItem>
                      <SelectItem value="90">90 mins</SelectItem>
                      <SelectItem value="120">120 mins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Legend */}
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-300 rounded"></div>
                    <span>Not available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded"></div>
                    <span>Booked</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                    <span>Booked by you</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span>Selected</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  Today
                </Button>
                <div className="text-sm font-medium">
                  Jun 28, 2025 - Jul 4, 2025
                </div>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm">‹</Button>
                  <Button variant="outline" size="sm">›</Button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="border rounded-lg overflow-hidden w-full">
              {/* Header */}
              <div className="grid grid-cols-8 bg-gray-50 min-w-[800px]">
                <div className="p-3 text-sm font-medium text-gray-600 border-r">UTC+07:00</div>
                <div className="p-3 text-center border-r">
                  <div className="text-xs text-gray-500">SAT</div>
                  <div className="text-sm font-medium">28</div>
                </div>
                <div className="p-3 text-center border-r">
                  <div className="text-xs text-gray-500">SUN</div>
                  <div className="text-sm font-medium">29</div>
                </div>
                <div className="p-3 text-center border-r">
                  <div className="text-xs text-gray-500">MON</div>
                  <div className="text-sm font-medium">30</div>
                </div>
                <div className="p-3 text-center border-r">
                  <div className="text-xs text-gray-500">TUE</div>
                  <div className="text-sm font-medium">1</div>
                </div>
                <div className="p-3 text-center border-r">
                  <div className="text-xs text-gray-500">WED</div>
                  <div className="text-sm font-medium">2</div>
                </div>
                <div className="p-3 text-center border-r">
                  <div className="text-xs text-gray-500">THU</div>
                  <div className="text-sm font-medium">3</div>
                </div>
                <div className="p-3 text-center">
                  <div className="text-xs text-gray-500">FRI</div>
                  <div className="text-sm font-medium">4</div>
                </div>
              </div>

              {/* Time slots */}
              <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
                <div className="min-w-[800px]">
                  {Array.from({ length: 28 }, (_, i) => {
                    const hour = 8 + Math.floor(i / 2);
                    const minute = i % 2 === 0 ? '00' : '30';
                    const timeLabel = `${hour.toString().padStart(2, '0')}:${minute}`;
                    
                    return (
                      <div key={i} className="grid grid-cols-8 border-t">
                        <div className="p-2 text-xs text-gray-500 border-r bg-gray-50 min-w-[100px]">
                          {timeLabel}
                        </div>
                        {Array.from({ length: 7 }, (_, dayIndex) => {
                          // Mock availability data - in real app this would come from API
                          const isAvailable = Math.random() > 0.3;
                          const isBooked = Math.random() > 0.8;
                          const isBookedByUser = Math.random() > 0.9;
                          
                          // Check if this slot is selected
                          const isSelected = isSlotInSelectedRange(i, dayIndex);
                          
                          let bgColor = 'bg-gray-100'; // Not available
                          let hoverColor = '';
                          let cursor = 'cursor-not-allowed';
                          let borderColor = 'border-gray-200';
                          
                          if (isSelected) {
                            bgColor = 'bg-purple-500';
                            borderColor = 'border-purple-600';
                            cursor = 'cursor-pointer';
                            hoverColor = 'hover:bg-purple-600';
                          } else if (isBookedByUser) {
                            bgColor = 'bg-yellow-400';
                            cursor = 'cursor-pointer';
                            hoverColor = 'hover:bg-yellow-500';
                          } else if (isBooked) {
                            bgColor = 'bg-blue-400';
                            cursor = 'cursor-not-allowed';
                          } else if (isAvailable) {
                            bgColor = 'bg-green-400';
                            cursor = 'cursor-pointer';
                            hoverColor = 'hover:bg-green-500';
                          }
                          
                          // Add diagonal stripes for unavailable slots
                          const stripePattern = !isAvailable && !isBooked && !isBookedByUser && !isSelected
                            ? 'bg-gradient-to-br from-gray-200 via-transparent to-gray-200 bg-[length:8px_8px]'
                            : '';
                          
                          // Calculate slot height based on session duration
                          const slotHeight = sessionDuration <= 30 ? 'h-8' : 
                                           sessionDuration <= 45 ? 'h-10' : 
                                           sessionDuration <= 60 ? 'h-12' : 
                                           sessionDuration <= 90 ? 'h-16' : 'h-20';
                          
                          return (
                            <div
                              key={dayIndex}
                              className={`${slotHeight} border-r ${borderColor} ${bgColor} ${hoverColor} ${cursor} ${stripePattern} transition-all duration-200 min-w-[100px] flex items-center justify-center relative group`}
                              onClick={() => {
                                if (isAvailable || isBookedByUser) {
                                  handleTimeSlotClick(i, dayIndex, true);
                                }
                              }}
                              onMouseEnter={() => {
                                // Show preview of selection range on hover
                                if (isAvailable && !isSelected) {
                                  // Add preview styling if needed
                                }
                              }}
                            >
                              {/* Selection overlay for selected slots */}
                              {isSelected && (
                                <div className="absolute inset-0 bg-purple-500 bg-opacity-20 border-2 border-purple-500 rounded-sm flex items-center justify-center">
                                  <div className="text-xs text-white font-bold bg-purple-600 px-1 py-0.5 rounded">
                                    ✓
                                  </div>
                                </div>
                              )}
                              
                              {/* Show session duration indicator on hover for available slots */}
                              {(isAvailable || isBookedByUser) && !isSelected && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white font-medium bg-black bg-opacity-50 px-1 py-0.5 rounded">
                                  {sessionDuration}m
                                </div>
                              )}
                              
                              {/* Show range preview on hover */}
                              {isAvailable && !isSelected && (
                                <div className="opacity-0 group-hover:opacity-20 absolute inset-0 bg-purple-500 border border-purple-400 rounded-sm"></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Time Range Info */}
            {selectedTimeSlots.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">Selected Time Range</h4>
                <div className="text-sm text-purple-700">
                  <p>Duration: {sessionDuration} minutes</p>
                  <p>Slots selected: {selectedTimeSlots.length}</p>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTimeSlots([])}
                      className="text-purple-600 border-purple-300 hover:bg-purple-100"
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                {selectedTimeSlots.length > 0 
                  ? `${selectedTimeSlots.length} time slot${selectedTimeSlots.length > 1 ? 's' : ''} selected`
                  : 'Click on available time slots to select your preferred session time'
                }
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTimeSlots([]);
                    setIsScheduleDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedTimeSlots.length === 0) {
                      toast.warning('Please select a time range first');
                      return;
                    }
                    
                    // Process the selected time slots
                    const firstSlot = selectedTimeSlots[0];
                    const [timeIndex, dayIndex] = firstSlot.split('-').map(Number);
                    const hour = 8 + Math.floor(timeIndex / 2);
                    const minute = timeIndex % 2 === 0 ? '00' : '30';
                    const startTime = `${hour.toString().padStart(2, '0')}:${minute}`;
                    
                    const endTime = new Date();
                    endTime.setHours(hour, Number(minute) + sessionDuration);
                    const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
                    
                    console.log('Booking details:', {
                      course: selectedCourse?.course_name,
                      day: dayIndex,
                      startTime,
                      endTime: endTimeStr,
                      duration: sessionDuration,
                      slots: selectedTimeSlots
                    });
                    
                    toast.success(`Schedule saved! ${startTime} - ${endTimeStr} (${sessionDuration} mins)`);
                    setSelectedTimeSlots([]);
                    setIsScheduleDialogOpen(false);
                  }}
                  disabled={selectedTimeSlots.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  Book Selected Time
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>



      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Course"
      >
        {selectedCourse && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{selectedCourse.course_name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCourse}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete Course'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Apply Tutor Modal */}
      <Modal
        isOpen={isApplyTutorDialogOpen}
        onClose={() => {
          setIsApplyTutorDialogOpen(false);
          setSelectedTutors([]);
        }}
        title="Apply Tutors to Course"
        maxWidth="max-w-4xl"
      >
        {selectedCourse && (
          <div className="space-y-6">
            {/* Course Info */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-3 bg-blue-500 rounded-xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{selectedCourse.course_name}</h3>
                <p className="text-sm text-gray-600">{selectedCourse.subject} • {selectedCourse.course_level}</p>
              </div>
            </div>

            {/* Available Tutors */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Select Tutors to Apply:</h4>
              {availableTutors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {availableTutors.map((tutor) => (
                    <div key={tutor.accountId} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`tutor-${tutor.accountId}`}
                          checked={selectedTutors.includes(tutor.accountId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTutors([...selectedTutors, tutor.accountId]);
                            } else {
                              setSelectedTutors(selectedTutors.filter(id => id !== tutor.accountId));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={tutor.avatar} />
                          <AvatarFallback>
                            <GraduationCap className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <label htmlFor={`tutor-${tutor.accountId}`} className="font-medium cursor-pointer">
                            {tutor.firstName} {tutor.lastName}
                          </label>
                          <p className="text-sm text-gray-600">{tutor.email}</p>
                          {tutor.phoneNumber && (
                            <p className="text-sm text-gray-500">{tutor.phoneNumber}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No tutors available</p>
                </div>
              )}
            </div>

            {/* Selected Count */}
            {selectedTutors.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  {selectedTutors.length} tutor{selectedTutors.length > 1 ? 's' : ''} selected
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsApplyTutorDialogOpen(false);
                  setSelectedTutors([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyTutors}
                disabled={isSubmitting || selectedTutors.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Applying...' : `Apply ${selectedTutors.length} Tutor${selectedTutors.length > 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default StaffCourseController; 