import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Calendar, UserCircle, Edit2, X, Shield, Camera,
  Mail,
  Phone,
  MapPin,
  Save,
  Ticket,
  BookOpen,
  FileText,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  CalendarDays
} from 'lucide-react';
import AvatarUpload from '@/components/AvatarUpload';
import { useAppDispatch } from '@/redux/hooks';
import { updateUserAvatar } from '@/redux/slices/authSlice';
import { toast } from 'react-toastify';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserTicketController } from '@/components/tickets/UserTicketController';
import { ScheduleView } from '@/components/ui/ScheduleView';

// Define interfaces for location data
interface Ward {
  id: string;
  full_name: string;
}

interface District {
  id: string;
  full_name: string;
  data3?: Ward[];
}

interface Province {
  id: string;
  full_name: string;
  data2?: District[];
  data3?: Ward[];
}

  // Type definitions for the API response
interface UserProfileData {
  accountId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  gender: string;
  dob: string;
  avatar: string | null;
  status: string;
  roleName: string;
  createdAt: string;
  details: any;
  // Separated address components for editing
  province?: string;
  district?: string;
  ward?: string;
}

interface RecentClass {
  classId: string;
  className: string;
  subject: string;
  date: string;
  status: 'completed' | 'ongoing' | 'scheduled';
}

interface TestHistory {
  testId: string;
  testName: string;
  subject: string;
  score: number;
  maxScore: number;
  completedAt: string;
  status: 'passed' | 'failed' | 'pending';
}

interface ApiResponse {
  result: string;
  correlationId: string;
  data: UserProfileData;
}


const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};


const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'bg-red-500';
    case 'tutor':
      return 'bg-blue-500';
    case 'student':
      return 'bg-green-500';
    case 'parent':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};


// Create avatar URL with stable cache-busting, similar to Header
const getAvatarUrl = (avatar: string | null | undefined) => {
  return avatar ? `${avatar}?v=${avatar.split('/').pop()?.split('.')[0] || 'default'}` : undefined;
};



const getInitials = (firstName: string, lastName: string) => {
  if (!firstName || !lastName) return 'U';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [formData, setFormData] = useState<UserProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Password change states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{[key: string]: string}>({});
  
  // Location data states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  
  // Recent activity states
  const [recentClasses, setRecentClasses] = useState<RecentClass[]>([]);
  const [testHistory, setTestHistory] = useState<TestHistory[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  // Schedule data states
  const [scheduleEvents, setScheduleEvents] = useState<any[]>([]);

  
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    fetchUserProfile();
    fetchProvinces();
  }, []);

  // Fetch recent activity when profile is loaded
  useEffect(() => {
    if (profile?.accountId) {
      fetchRecentActivity();
    }
  }, [profile?.accountId]);
  
  // Update location dropdowns when provinces are loaded and profile data is available
  useEffect(() => {
    if (provinces.length > 0 && profile && profile.province) {
      const selectedProvince = provinces.find(p => p.full_name === profile.province);
      if (selectedProvince) {
        if (selectedProvince.data2) {
          setDistricts(selectedProvince.data2);
          if (profile.district) {
            const selectedDistrict = selectedProvince.data2.find(d => d.full_name === profile.district);
            if (selectedDistrict && selectedDistrict.data3) {
              setWards(selectedDistrict.data3);
            }
          }
        } else if (selectedProvince.data3) {
          setDistricts([]);
          setWards(selectedProvince.data3);
        }
      }
    }
  }, [provinces, profile]);
  
  // Fetch province data from API
  const fetchProvinces = async () => {
    try {
      const response = await axios.get("https://esgoo.net/api-tinhthanh/4/0.htm");
      const data = response.data.data;
      setProvinces(data);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };



  // Fetch recent activity data
  const fetchRecentActivity = async () => {
    setIsLoadingActivity(true);
    try {
      // Mock data for recent classes (replace with actual API calls)
      const mockRecentClasses: RecentClass[] = [
        {
          classId: 'CL-001',
          className: 'Advanced SAT Math',
          subject: 'Mathematics',
          date: '2024-01-15',
          status: 'completed'
        },
        {
          classId: 'CL-002', 
          className: 'SAT Reading Comprehension',
          subject: 'English',
          date: '2024-01-12',
          status: 'ongoing'
        },
        {
          classId: 'CL-003',
          className: 'SAT Writing & Language',
          subject: 'English',
          date: '2024-01-20',
          status: 'scheduled'
        }
      ];

      setRecentClasses(mockRecentClasses);

      // Fetch real test history from API
      if (profile?.accountId) {
        try {
          const params = {
            accountId: profile.accountId,
            pageNumber: 1, // First page
            pageSize: 3,   // Only get 3 recent tests
            sortBy: 'createdAt',
            orderType: 'DESC' // Descending order for most recent first
          };

          const response = await api.get('/sat/exam/get-history-exams', { params });
          
          if (response.data.result === 'OK' && response.data.data?.items) {
            const apiItems = response.data.data.items;
            
            // Check if we have actual data
            if (apiItems.length === 0) {
              console.log('No test history found from API');
              setTestHistory([]);
              return;
            } else {
              // Transform API response to TestHistory format
              const apiTests = apiItems.map((exam: any) => {
                // Determine status based on progress and score
                let status: 'passed' | 'failed' | 'pending' = 'pending';
                if (exam.progress === 'End' || exam.progress === 'COMPLETED') {
                  status = exam.finalScore >= 600 ? 'passed' : 'failed'; // Assuming 600+ is passing
                } else if (exam.progress === 'IN_PROGRESS') {
                  status = 'pending'; // Show as pending for in-progress tests in profile view
                }

                return {
                  testId: exam.examId || 'unknown',
                  testName: 'SAT Practice Test',
                  subject: 'Full Test',
                  score: exam.finalScore || 0,
                  maxScore: 1600,
                  completedAt: exam.endTime || exam.startTime || new Date().toISOString(),
                  status
                };
              });

              setTestHistory(apiTests);
              console.log('Fetched recent test history from API:', apiTests);
              return; // Exit early if we have API data
            }
          }
        } catch (apiError) {
          console.warn('Failed to fetch test history from API:', apiError);
          // Set empty array on API error
          setTestHistory([]);
        }
      }

      const mockScheduleEvents = [
        {
          id: 'event-1',
          title: 'SAT Math - Algebra Review',
          start: new Date(2024, 11, 25, 9, 0).toISOString(),
          end: new Date(2024, 11, 25, 10, 30).toISOString(),
          course_name: 'SAT Math Prep',
          tutor_name: 'Dr. Smith',
          status: 'Scheduled' as const,
          location: 'Room 101',
          type: 'class' as const
        },
        {
          id: 'event-2',
          title: 'SAT Reading - Literature Analysis',
          start: new Date(2024, 11, 25, 14, 0).toISOString(),
          end: new Date(2024, 11, 25, 15, 30).toISOString(),
          course_name: 'SAT Reading & Writing',
          tutor_name: 'Prof. Johnson',
          status: 'Scheduled' as const,
          location: 'Room 203',
          type: 'class' as const
        },
        {
          id: 'event-3',
          title: 'SAT Math - Geometry Practice',
          start: new Date(2024, 11, 26, 10, 0).toISOString(),
          end: new Date(2024, 11, 26, 11, 30).toISOString(),
          course_name: 'SAT Math Prep',
          tutor_name: 'Dr. Smith',
          status: 'Scheduled' as const,
          location: 'Room 101',
          type: 'class' as const
        },
        {
          id: 'event-4',
          title: 'SAT Writing - Essay Workshop',
          start: new Date(2024, 11, 27, 13, 0).toISOString(),
          end: new Date(2024, 11, 27, 14, 30).toISOString(),
          course_name: 'SAT Reading & Writing',
          tutor_name: 'Prof. Johnson',
          status: 'Scheduled' as const,
          location: 'Online',
          type: 'class' as const
        },
        {
          id: 'event-5',
          title: 'SAT Practice Test',
          start: new Date(2024, 11, 28, 9, 0).toISOString(),
          end: new Date(2024, 11, 28, 12, 0).toISOString(),
          course_name: 'SAT Full Test',
          tutor_name: 'Testing Center',
          status: 'Scheduled' as const,
          location: 'Exam Hall A',
          type: 'exam' as const
        },
        {
          id: 'event-6',
          title: 'One-on-One Consultation',
          start: new Date(2024, 11, 29, 15, 0).toISOString(),
          end: new Date(2024, 11, 29, 16, 0).toISOString(),
          course_name: 'Personal Guidance',
          tutor_name: 'Academic Advisor',
          status: 'Scheduled' as const,
          location: 'Office 205',
          type: 'consultation' as const
        }
      ];

      setScheduleEvents(mockScheduleEvents);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setIsLoadingActivity(false);
    }
  };
  
  // Parse address into components for editing
  const parseAddress = (address: string) => {
    if (!address) return { province: '', district: '', ward: '' };
    
    const parts = address.split(', ');
    if (parts.length >= 3) {
      return {
        ward: parts[0].trim(),
        district: parts[1].trim(),
        province: parts[2].trim()
      };
    }
    return { province: '', district: '', ward: '' };
  };
  
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<ApiResponse>('/id/account/info');
      
      if (response.data.result === 'OK' && response.data.data) {
        const profileData = response.data.data;
        const addressComponents = parseAddress(profileData.address);
        
        const enrichedProfile = {
          ...profileData,
          province: addressComponents.province,
          district: addressComponents.district,
          ward: addressComponents.ward
        };
        
        setProfile(enrichedProfile);
        setFormData(enrichedProfile);
      } else {
        setError(t('profile.error'));
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(t('profile.error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    
    const { name, value } = e.target;
    setFormData(prev => prev ? {
      ...prev,
      [name]: value
    } : null);
  };

  // Handle location changes (province, district, ward)
  const handleLocationChange = (name: string, value: string) => {
    if (!formData) return;
    
    const newFormData = { ...formData, [name]: value };
    
    // Handle province change - update districts
    if (name === "province") {
      const selectedProvince = provinces.find(p => p.full_name === value);
      if (selectedProvince) {
        if (selectedProvince.data2) {
          setDistricts(selectedProvince.data2);
          setWards([]);
        } else if (selectedProvince.data3) {
          setDistricts([]);
          setWards(selectedProvince.data3);
        } else {
          setDistricts([]);
          setWards([]);
        }
      }
      newFormData.district = "";
      newFormData.ward = "";
    }
    
    // Handle district change - update wards
    if (name === "district") {
      const selectedDistrict = districts.find(d => d.full_name === value);
      if (selectedDistrict && selectedDistrict.data3) {
        setWards(selectedDistrict.data3);
      } else {
        setWards([]);
      }
      newFormData.ward = "";
    }
    
    setFormData(newFormData);
  };

  const handleAvatarUpdate = async (avatarUrl: string) => {
    if (!formData) return;
    
    try {
      setIsUpdatingProfile(true);
      setError(null); // Clear any previous errors
      
      // Update profile with new avatar
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        gender: formData.gender,
        dob: formData.dob,
        avatar: avatarUrl
      };

      console.log('Updating profile with new avatar:', avatarUrl);
      const response = await api.put('/id/account/info/update', updateData);
      
      if (response.data.result === 'OK') {
        // Update local state
        const updatedProfile = { ...formData, avatar: avatarUrl };
        setProfile(updatedProfile);
        setFormData(updatedProfile);
        
        // Close avatar upload modal
        setShowAvatarUpload(false);
        
        // Show success message (you can add toast notification here)
        console.log('Avatar updated successfully');
        toast.success(t('profile.avatar.updateSuccess') || 'Avatar updated successfully!');
        
        // Refresh profile data to ensure consistency with server
        setTimeout(() => {
          fetchUserProfile();
        }, 500);

        // Dispatch the action to update the avatar in the Redux store
        dispatch(updateUserAvatar(avatarUrl));
        
        // Also store the avatar in localStorage for persistence
        localStorage.setItem('userAvatar', avatarUrl);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating avatar:', err);
      setError(t('profile.updateFailed') || 'Failed to update avatar');
    } finally {
      setIsUpdatingProfile(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    try {
      setIsUpdatingProfile(true);
      
      // Construct full address from components
      const fullAddress = formData.ward && formData.district && formData.province 
        ? `${formData.ward}, ${formData.district}, ${formData.province}`
        : formData.address; // fallback to existing address if components are missing
      
      // Prepare update data (excluding avatar as it's handled separately)
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        address: fullAddress,
        gender: formData.gender,
        dob: formData.dob,
        avatar: formData.avatar // Keep current avatar
      };

      const response = await api.put('/id/account/info/update', updateData);
      
      if (response.data.result === 'OK') {
        setProfile(formData);
        setActiveTab('overview');
        // Show success message (you can add toast notification here)
        console.log('Profile updated successfully');
        toast.success(t('profile.updateSuccess') || 'Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(t('profile.updateFailed'));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Password validation function
  const validatePassword = (password: string) => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push(t('profile.validation.passwordTooShort') || 'Password must be at least 8 characters');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push(t('profile.validation.passwordNoUppercase') || 'Password must contain at least one uppercase letter');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push(t('profile.validation.passwordNoSpecial') || 'Password must contain at least one special character');
    }
    
    if (/\s/.test(password)) {
      errors.push(t('profile.validation.passwordNoSpaces') || 'Password cannot contain spaces');
    }
    
    return errors;
  };

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle password change submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: {[key: string]: string} = {};
    
    // Validate current password
    if (!passwordForm.currentPassword) {
      errors.currentPassword = t('profile.validation.required') || 'This field is required';
    }
    
    // Validate new password
    if (!passwordForm.newPassword) {
      errors.newPassword = t('profile.validation.required') || 'This field is required';
    } else {
      const passwordValidationErrors = validatePassword(passwordForm.newPassword);
      if (passwordValidationErrors.length > 0) {
        errors.newPassword = passwordValidationErrors[0];
      }
    }
    
    // Validate confirm password
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = t('profile.validation.required') || 'This field is required';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = t('profile.validation.passwordMismatch') || 'Passwords do not match';
    }
    
    // Check if new password and confirm password are the same
    if (passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = t('profile.validation.passwordMismatch') || 'New password and confirm password must match';
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    try {
      setIsChangingPassword(true);
      setPasswordErrors({});
      
      // Call the correct API endpoint with POST method
      const response = await api.post('/auth/account/change-password', {
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (response.data.result === 'OK' || response.status === 200) {
        // Reset form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        toast.success(t('profile.success.passwordChanged') || 'Password changed successfully!');
      } else {
        // Handle API error response
        const errorMessage = response.data.message || 'Failed to change password';
        setPasswordErrors({ general: errorMessage });
      }
    } catch (err: any) {
      console.error('Error changing password:', err);
      
      // Handle different types of errors
      if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.message || t('profile.validation.incorrectCurrentPassword') || 'Current password is incorrect';
        setPasswordErrors({ 
          currentPassword: errorMessage
        });
      } else if (err.response?.status === 401) {
        setPasswordErrors({ 
          general: t('profile.validation.unauthorized') || 'Unauthorized. Please login again.' 
        });
      } else if (err.response?.data?.message) {
        setPasswordErrors({ 
          general: err.response.data.message 
        });
      } else {
        setPasswordErrors({ 
          general: t('profile.validation.serverError') || 'Server error. Please try again later.' 
        });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Create avatar URL with stable cache-busting, similar to Header
  const getAvatarUrl = (avatar: string | null | undefined) => {
    return avatar ? `${avatar}?v=${avatar.split('/').pop()?.split('.')[0] || 'default'}` : undefined;
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-500';
      case 'tutor':
        return 'bg-blue-500';
      case 'student':
        return 'bg-green-500';
      case 'parent':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getClassStatusBadge = (status: 'completed' | 'ongoing' | 'scheduled') => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 hover:text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100 hover:text-gray-800';
    }
  };

  const getTestStatusBadge = (status: 'passed' | 'failed' | 'pending') => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100 hover:text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100 hover:text-gray-800';
    }
  };

  const calculateScorePercentage = (score: number, maxScore: number) => {
    return Math.round((score / maxScore) * 100);
  };

  const tabs = [
    { id: 'overview', label: t('profile.tabs.overview'), icon: User },
    { id: 'edit', label: t('profile.tabs.edit'), icon: Edit2 },
    ...(profile?.roleName?.toLowerCase() === 'student' || profile?.roleName?.toLowerCase() === 'tutor' 
      ? [{ id: 'schedule', label: t('profile.tabs.schedule'), icon: CalendarDays }] 
      : []),
    ...(profile?.roleName?.toLowerCase() === 'student' ? [{ id: 'tickets', label: 'Support Tickets', icon: Ticket }] : []),
    { id: 'security', label: t('profile.tabs.security'), icon: Shield },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          {/* Hero Section Skeleton */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-80">
            <div className="container mx-auto px-6 py-8 h-full flex items-end">
              <div className="flex items-center space-x-6">
                <div className="w-32 h-32 bg-white/20 rounded-2xl"></div>
                <div className="text-white">
                  <div className="h-8 bg-white/20 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-32 mb-4"></div>
                  <div className="h-6 bg-white/20 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content Skeleton */}
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('profile.error')}
          </h3>
          <p className="text-gray-600 mb-6">
            {error || t('profile.error')}
          </p>
          <button 
            onClick={fetchUserProfile}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            {t('profile.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-purple-600/50"></div>
        
        <div className="relative container mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-32 h-32 rounded-2xl border-4 border-white/30 shadow-2xl">
                  <AvatarImage 
                    src={getAvatarUrl(profile.avatar)} 
                    alt={`${profile.lastName} ${profile.firstName}`}
                    className="object-cover rounded-2xl"
                  />
                  <AvatarFallback className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-sm text-4xl font-bold text-white border-4 border-white/30">
                    {getInitials(profile.lastName, profile.firstName)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Loading Overlay */}
                {isUpdatingProfile && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                
                {/* Status Indicator */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                
                {/* Camera Icon for Edit */}
                <button 
                  onClick={() => setShowAvatarUpload(true)}
                  disabled={isUpdatingProfile}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 disabled:opacity-50 rounded-full flex items-center justify-center transition-colors"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              
              {/* User Info */}
              <div className="text-white space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getRoleColor(profile.roleName)}`}>
                    {t(`profile.roles.${profile.roleName.toLowerCase()}`)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-blue-100">
                  <UserCircle className="w-5 h-5" />
                  <span>{profile.username}</span>
                </div>
                
                <div className="flex items-center gap-6 text-blue-100 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{t('profile.header.memberSince')} {formatDate(profile.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Profile Card */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <User className="w-6 h-6" />
                        Personal Information
                      </h3>
                      <button 
                        onClick={() => setActiveTab('edit')}
                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Contact Information */}
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                          Contact Details
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="flex items-start gap-3 group">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1 text-left">
                                Email Address
                              </label>
                              <span className="text-gray-900 font-medium">{profile.email}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 group">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                              <Phone className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1 text-left">
                                Phone Number
                              </label>
                              <span className="text-gray-900 font-medium">{profile.phoneNumber}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 group">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                              <MapPin className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1 text-left">
                                Address
                              </label>
                              <span className="text-gray-900 font-medium">{profile.address}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Personal Details */}
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                          Personal Details
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="flex items-start gap-3 group">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                              <Calendar className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1 text-left">
                                Date of Birth
                              </label>
                              <span className="text-gray-900 font-medium">{formatDate(profile.dob)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 group">
                            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                              <User className="w-5 h-5 text-pink-600" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1 text-left">
                                Gender
                              </label>
                              <span className="text-gray-900 font-medium capitalize">{profile.gender}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 group">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                              <UserCircle className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1 text-left">
                                Username
                              </label>
                              <span className="text-gray-900 font-medium">{profile.username}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Account Status Card */}
              <div className="space-y-6">

                {/* Only show recent activity for students */}
                {profile?.roleName?.toLowerCase() === 'student' && (
                  <>
                    {/* Recent Classes Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          Recent Classes
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Navigate to full class history page
                            toast.info('Class history page will be implemented soon');
                          }}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <TrendingUp className="w-4 h-4 mr-1" />
                          View All
                        </Button>
                      </div>
                      
                      {isLoadingActivity ? (
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse p-3 bg-gray-50 rounded-lg">
                              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          ))}
                        </div>
                      ) : recentClasses.length > 0 ? (
                        <div className="space-y-3">
                          {recentClasses.slice(0, 3).map((classItem) => (
                            <div key={classItem.classId} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-sm font-medium text-gray-900">{classItem.className}</h5>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClassStatusBadge(classItem.status)}`}>
                                  {classItem.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  {classItem.subject}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(classItem.date)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No recent classes</p>
                        </div>
                      )}
                    </div>

                    {/* Test History Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Award className="w-5 h-5 text-purple-600" />
                          Recent Test Results
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/test-history')}
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        >
                          <TrendingUp className="w-4 h-4 mr-1" />
                          View All
                        </Button>
                      </div>
                      
                      {isLoadingActivity ? (
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                                </div>
                                <div className="text-right">
                                  <div className="h-4 bg-gray-200 rounded w-12 mb-1"></div>
                                  <div className="h-3 bg-gray-200 rounded w-8"></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : testHistory.length > 0 ? (
                        <div className="space-y-3">
                          {testHistory.slice(0, 3).map((test) => (
                            <div key={test.testId} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-sm font-medium text-gray-900">{test.testName}</h5>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTestStatusBadge(test.status)}`}>
                                  {test.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {test.subject}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(test.completedAt)}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-gray-900">
                                    {test.score}/{test.maxScore}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {calculateScorePercentage(test.score, test.maxScore)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No test history</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Account Summary for non-students */}
                {profile?.roleName?.toLowerCase() !== 'student' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-blue-600" />
                      Account Summary
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Role</p>
                          </div>
                        </div>
                        <Badge className={`${getRoleColor(profile.roleName)} text-white`}>
                          {t(`profile.roles.${profile.roleName.toLowerCase()}`)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Account Status</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800">
                          Active
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Member Since</p>
                          </div>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 hover:text-purple-800">
                          {formatDate(profile.createdAt)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
                
                              </div>
              </div>
            </div>
            </motion.div>
          )}

          {activeTab === 'schedule' && (profile?.roleName?.toLowerCase() === 'student' || profile?.roleName?.toLowerCase() === 'tutor') && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-full mx-auto">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <CalendarDays className="w-6 h-6" />
                          {t('profile.schedule.title')}
                        </h3>
                        <p className="text-blue-100 mt-1 text-sm">
                          {t('profile.schedule.subtitle')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-[calc(100vh-250px)]">
                    <ScheduleView
                      events={scheduleEvents}
                      onEventClick={(event) => {
                        toast.info(`Event: ${event.title} with ${event.tutor_name}`);
                      }}
                      onCreateEvent={() => {
                        if (profile?.roleName?.toLowerCase() === 'tutor') {
                          toast.info('Create event functionality coming soon!');
                        } else {
                          toast.info('Only tutors can create events');
                        }
                      }}
                      userRole={profile?.roleName?.toLowerCase() || ''}
                      canCreateEvents={profile?.roleName?.toLowerCase() === 'tutor'}
                      className="h-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'edit' && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('profile.edit.title')}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Avatar Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-600" />
                    {t('profile.edit.avatar')}
                  </h3>
                  
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-4 border-gray-200">
                        <AvatarImage 
                          src={getAvatarUrl(formData?.avatar)} 
                          alt={`${formData?.firstName || ''} ${formData?.lastName || ''}`}
                          className="object-cover"
                        />
                        <AvatarFallback className="w-24 h-24 bg-gray-100 text-2xl font-bold text-gray-600 border-4 border-gray-200">
                          {getInitials(formData?.firstName || '', formData?.lastName || '')}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Loading Overlay */}
                      {isUpdatingProfile && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => setShowAvatarUpload(true)}
                        disabled={isUpdatingProfile}
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowAvatarUpload(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {t('profile.edit.uploadAvatar')}
                      </button>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('profile.edit.avatarHint') || 'Click to upload a new profile picture'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personal Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    {t('profile.edit.personalInfo')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('profile.fields.firstName')}
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData?.firstName || ''}
                        onChange={handleChange}
                        placeholder={t('profile.placeholders.firstName')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('profile.fields.lastName')}
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData?.lastName || ''}
                        onChange={handleChange}
                        placeholder={t('profile.placeholders.lastName')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('profile.fields.email')}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData?.email || ''}
                        onChange={handleChange}
                        placeholder={t('profile.placeholders.email')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {t('profile.edit.emailReadonly') || 'Email cannot be changed'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('profile.fields.phoneNumber')}
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData?.phoneNumber || ''}
                        onChange={handleChange}
                        placeholder={t('profile.placeholders.phoneNumber')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('profile.fields.gender')}
                      </label>
                      <select
                        name="gender"
                        value={formData?.gender || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="male">{t('profile.gender.male')}</option>
                        <option value="female">{t('profile.gender.female')}</option>
                        <option value="other">{t('profile.gender.other')}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('profile.fields.dob')}
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formData?.dob?.split('T')[0] || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Address Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    {t('profile.edit.contactInfo')}
                  </h3>
                  
                  {/* Location fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('profile.fields.province')}
                      </label>
                      <Select
                        value={formData?.province || ''}
                        onValueChange={(value: string) => handleLocationChange('province', value)}
                      >
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder={t('profile.placeholders.province')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {provinces.map((province) => (
                            <SelectItem key={province.id} value={province.full_name} className="text-base py-2">
                              {province.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('profile.fields.district')}
                      </label>
                      <Select
                        value={formData?.district || ''}
                        onValueChange={(value: string) => handleLocationChange('district', value)}
                        disabled={!formData?.province}
                      >
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder={t('profile.placeholders.district')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {districts.map((district) => (
                            <SelectItem key={district.id} value={district.full_name} className="text-base py-2">
                              {district.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('profile.fields.ward')}
                      </label>
                      <Select
                        value={formData?.ward || ''}
                        onValueChange={(value: string) => handleLocationChange('ward', value)}
                        disabled={!formData?.district}
                      >
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder={t('profile.placeholders.ward')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {wards.map((ward) => (
                            <SelectItem key={ward.id} value={ward.full_name} className="text-base py-2">
                              {ward.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => {
                      setFormData(profile);
                      setActiveTab('overview');
                    }}
                    disabled={isUpdatingProfile}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    {t('profile.actions.cancel')}
                  </button>
                  <button 
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isUpdatingProfile ? t('profile.actions.saving') : t('profile.actions.save')}
                  </button>
                </div>
                            </form>
            </div>
          </div>
            </motion.div>
          )}

          {activeTab === 'tickets' && profile?.roleName?.toLowerCase() === 'student' && (
            <motion.div
              key="tickets"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-7xl mx-auto">
                <UserTicketController />
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-500" />
                {t('profile.security.title')}
              </h2>
              
              <div className="space-y-8">
                {/* Change Password */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('profile.security.changePassword')}
                  </h3>
                  
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    {/* General error message */}
                    {passwordErrors.general && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{passwordErrors.general}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('profile.security.currentPassword')}
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder={t('profile.security.currentPasswordPlaceholder')}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          passwordErrors.currentPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {passwordErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('profile.security.newPassword')}
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          placeholder={t('profile.security.newPasswordPlaceholder')}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            passwordErrors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {passwordErrors.newPassword && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('profile.security.confirmPassword')}
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder={t('profile.security.confirmPasswordPlaceholder')}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            passwordErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      {t('profile.security.passwordHint')}
                    </p>
                    
                    <button 
                      type="submit"
                      disabled={isChangingPassword}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isChangingPassword ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {t('profile.security.changing')}
                        </>
                      ) : (
                        t('profile.security.changePassword')
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Avatar Upload Modal */}
      {showAvatarUpload && formData && (
        <AvatarUpload
          currentAvatar={formData.avatar}
          firstName={formData.firstName}
          lastName={formData.lastName}
          onAvatarUpdate={handleAvatarUpdate}
          onClose={() => setShowAvatarUpload(false)}
        />
      )}
    </div>
  );
};

ProfilePage.Overview = ({ profile }: { profile: UserProfileData }) => {

  return (<div className="max-w-6xl mx-auto">

    <div className="grid grid-cols-3 gap-8">
      {/* Profile Avatar */}
      <div className="col-span-1 h-auto border border-gray rounded-lg py-4 px-6">
        <div className="flex flex-col items-center justify-center">
          <div className="font-bold text-2xl text-gray-700">{profile.firstName} {profile.lastName}</div>
        </div>
        <div className="mt-4 relative hidden rounded-full">
          <Avatar className="w-24 h-24 border-4 border-gray-200">
            <AvatarImage
              src={getAvatarUrl(profile?.avatar)}
              alt={`${profile?.firstName || ''} ${profile?.lastName || ''}`}
              className="object-cover"
            />
            <AvatarFallback className="w-24 h-24 bg-gray-100 text-2xl font-bold text-gray-600 border-4 border-gray-200">
              {getInitials(profile?.firstName || '', profile?.lastName || '')}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="mt-4">

          <div className="space-y-4">
            <div className="flex items-center text-left justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700 text-left">Status</p>
                <p className="text-xs text-gray-500">Account verification status</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${profile.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                }`}>
                {profile.status}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700 text-left">Role</p>
                <p className="text-xs text-gray-500">Your access level</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getRoleColor(profile.roleName)}`}>
                {profile.roleName}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700 text-left">Member Since</p>
                <p className="text-xs text-gray-500">Account creation date</p>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(profile.createdAt)}
              </span>
            </div>

          </div>
        </div>
      </div>
      {/* Main Profile Card */}
      <div className="col-span-2">
        <div className="bg-white rounded-xl border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-6 h-6" />
                Personal Information
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Contact Details
                </h4>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 group">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1 text-left">
                        Email Address
                      </label>
                      <span className="text-gray-900 font-medium">{profile.email}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1 text-left">
                        Phone Number
                      </label>
                      <span className="text-gray-900 font-medium">{profile.phoneNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1 text-left">
                        Address
                      </label>
                      <span className="text-gray-900 font-medium">{profile.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Personal Details
                </h4>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 group">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1 text-left">
                        Date of Birth
                      </label>
                      <span className="text-gray-900 font-medium">{formatDate(profile.dob)}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                      <User className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1 text-left">
                        Gender
                      </label>
                      <span className="text-gray-900 font-medium capitalize">{profile.gender}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <UserCircle className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1 text-left">
                        Username
                      </label>
                      <span className="text-gray-900 font-medium">{profile.username}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>);
};

export default ProfilePage; 