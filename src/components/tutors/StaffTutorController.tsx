import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Search, 
  Eye,
  Edit,
  Star,
  GraduationCap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  type Account
} from '@/pages/protected/admin/account/Models';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';   
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
import axios from 'axios';

interface StaffTutorControllerProps {
  className?: string;
}

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

interface TutorFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  dob: string;
  gender: string;
  major: string;
  shortDescription: string;
  description: string;
  teachingStyle: string;
  content: string;
  videoLink: string;
}

export function StaffTutorController({ className }: StaffTutorControllerProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tutors, setTutors] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [selectedTutor, setSelectedTutor] = useState<Account | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TutorFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    province: '',
    district: '',
    ward: '',
    dob: '',
    gender: 'Male',
    major: '',
    shortDescription: '',
    description: '',
    teachingStyle: '',
    content: '',
    videoLink: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Location data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  useEffect(() => {
    loadTutors();
    fetchProvinces();
  }, []);

  // Fetch province data from API
  const fetchProvinces = async () => {
    try {
      const response = await axios.get("https://esgoo.net/api-tinhthanh/4/0.htm");
      const data = response.data.data;
      setProvinces(data);
    } catch (error) {
      console.error("Error fetching provinces:", error);
      toast.error('Failed to load provinces');
    }
  };

  // Handle location changes (following register page pattern)
  const handleLocationChange = (name: string, value: string) => {
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

  // Helper function to map API response to Account interface
  const mapApiResponseToAccount = (apiAccount: any): Account => {
    return {
      accountId: apiAccount.accountId || '',
      firstName: apiAccount.firstName || '',
      lastName: apiAccount.lastName || '',
      email: apiAccount.email || '',
      phoneNumber: apiAccount.phoneNumber || '',
      address: apiAccount.address || '',
      gender: apiAccount.gender || '',
      dob: apiAccount.dob || '',
      avatar: apiAccount.avatar || '',
      status: apiAccount.status || 'ACTIVE',
      active: apiAccount.status === 'ACTIVE',
      created_at: apiAccount.createdAt || '',
      updated_at: apiAccount.updatedAt || '',
      // Note: tutorData might not be available in this endpoint
      tutorData: undefined,
      // Parse address components if needed
      province: '',
      district: '',
      ward: '',
      educationLevel: '',
      role: 'TUTOR'
    };
  };

  const loadTutors = async (filters = {}) => {
    try {
      setIsLoading(true);
      // Using the account tutors endpoint
      const response = await api.get('/id/account/tutors', {
        params: { 
          pageNumber: 1,
          pageSize: 50,
          ...filters 
        }
      });
      
      if (response.data?.result === 'OK' && Array.isArray(response.data.data)) {
        // Map API response to Account interface
        const mappedTutors = response.data.data.map(mapApiResponseToAccount);
        setTutors(mappedTutors);
      } else {
        // Fallback to local data for development
        const { default: tutorData } = await import('@/data/tutors.json');
        setTutors(tutorData as Account[]);
      }
    } catch (error) {
      console.error('Failed to load tutors:', error);
      // Fallback to local data
      try {
        const { default: tutorData } = await import('@/data/tutors.json');
        setTutors(tutorData as Account[]);
      } catch (fallbackError) {
        console.error('Failed to load fallback tutor data:', fallbackError);
        toast.error('Failed to load tutors');
        setTutors([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTutor = (tutor: Account) => {
    navigate(`/staff/tutors/${tutor.accountId}`);
  };

  const handleEditTutor = async (tutor: Account) => {
    setSelectedTutor(tutor);
    
    // Set form data
    setFormData({
      firstName: tutor.firstName,
      lastName: tutor.lastName,
      email: tutor.email,
      phoneNumber: tutor.phoneNumber,
      province: tutor.province,
      district: tutor.district,
      ward: tutor.ward,
      dob: tutor.dob,
      gender: tutor.gender,
      major: tutor.tutorData?.major || '',
      shortDescription: tutor.tutorData?.short_description || '',
      description: tutor.tutorData?.description || '',
      teachingStyle: tutor.tutorData?.teaching_style || '',
      content: tutor.tutorData?.content || '',
      videoLink: tutor.tutorData?.video_link || ''
    });
    
    // Load districts and wards for the selected province/district (following register page pattern)
    if (tutor.province) {
      const selectedProvince = provinces.find(p => p.full_name === tutor.province);
      if (selectedProvince) {
        if (selectedProvince.data2) {
          setDistricts(selectedProvince.data2);
          if (tutor.district) {
            const selectedDistrict = selectedProvince.data2.find(d => d.full_name === tutor.district);
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
    
    setIsEditDialogOpen(true);
  };



  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      province: '',
      district: '',
      ward: '',
      dob: '',
      gender: 'Male',
      major: '',
      shortDescription: '',
      description: '',
      teachingStyle: '',
      content: '',
      videoLink: ''
    });
    // Reset location dropdowns (following register page pattern)
    setDistricts([]);
    setWards([]);
  };



  const handleUpdateTutor = async () => {
    if (!selectedTutor) return;
    
    setIsSubmitting(true);
    try {
      // Prepare data for submission (following register page pattern)
      const submitData = {
        ...formData,
        address: `${formData.ward}, ${formData.district}, ${formData.province}`,
      };
      
      const response = await api.put(`/id/manager/account/tutor/${selectedTutor.accountId}`, submitData);
      
      if (response.data?.result === 'OK') {
        await loadTutors();
        setIsEditDialogOpen(false);
        setSelectedTutor(null);
        resetForm();
        toast.success('Tutor updated successfully');
      } else {
        throw new Error('Failed to update tutor');
      }
    } catch (error) {
      console.error('Failed to update tutor:', error);
      toast.error('Failed to update tutor. This is a demo - functionality not fully implemented.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const handleFilterChange = async (newSubjectFilter: string) => {
    setSubjectFilter(newSubjectFilter);
    const filters: any = {};
    
    if (newSubjectFilter !== 'ALL') {
      filters.subject = newSubjectFilter;
    }
    
    if (searchTerm.trim()) {
      filters.search = searchTerm.trim();
    }
    
    await loadTutors(filters);
  };

  const filteredTutors = tutors.filter(tutor => {
    if (!tutor) return false;
    const fullName = `${tutor.firstName} ${tutor.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         tutor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.accountId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Since tutorData is not available in the new API, we'll only filter by search term
    const matchesSubject = subjectFilter === 'ALL';
    
    return matchesSearch && matchesSubject;
  });

  // No subjects available from basic account data
  const subjects: string[] = [];

  const statsData = {
    total: tutors.length,
    active: tutors.filter(t => t.status === 'ACTIVE').length,
    inactive: tutors.filter(t => t.status !== 'ACTIVE').length,
    avgRating: 0, // No rating data available in basic account endpoint
  };

  if (isLoading) {
    return <ManagementPageSkeleton type="tutors" />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold">{t('staff.tutors.title')}</CardTitle>
                <CardDescription className="text-lg">
                  {t('staff.tutors.subtitle')}
                </CardDescription>
              </div>
            </div>

          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('staff.tutors.stats.total')}</p>
                <p className="text-2xl font-bold">{statsData.total}</p>
              </div>
              <User className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">{t('staff.tutors.stats.active')}</p>
                <p className="text-2xl font-bold text-green-700">{statsData.active}</p>
              </div>
              <User className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">{t('staff.tutors.stats.inactive')}</p>
                <p className="text-2xl font-bold text-red-700">{statsData.inactive}</p>
              </div>
              <User className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">{t('staff.tutors.stats.avgRating')}</p>
                <p className="text-2xl font-bold text-yellow-700">{statsData.avgRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tutors by name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={subjectFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject!}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutors.map((tutor) => (
          <Card key={tutor.accountId} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={tutor.avatar || tutor.tutorData?.avatar} />
                  <AvatarFallback>
                    {getInitials(tutor.firstName, tutor.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold truncate text-left">
                      {tutor.firstName} {tutor.lastName}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 text-left">{tutor.email}</p>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3 text-left">
                    {tutor.address}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                    <span>Phone: {tutor.phoneNumber}</span>
                  </div>
                  
                  <div className="flex space-x-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewTutor(tutor)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditTutor(tutor)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTutors.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tutors found</h3>
            <p className="text-gray-500">
              {searchTerm || subjectFilter !== 'ALL' 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first tutor'
              }
            </p>
          </CardContent>
        </Card>
      )}



      {/* Edit Tutor Modal */}
      <Modal
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          resetForm();
        }}
        title="Edit Tutor"
      >
        <div className="space-y-6 max-h-[500px] overflow-y-auto py-4">
          {/* User Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              User Information
            </h3>
            
            {/* First and Last Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/* Email and Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Date of Birth and Gender Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                <Input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Province and District Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Province</label>
                <Select
                  value={formData.province}
                  onValueChange={(value) => handleLocationChange("province", value)}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {provinces.map((province) => (
                      <SelectItem key={province.id} value={province.full_name}>
                        {province.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">District</label>
                <Select
                  value={formData.district}
                  onValueChange={(value) => handleLocationChange("district", value)}
                  disabled={!formData.province}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.full_name}>
                        {district.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ward */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Ward</label>
                <Select
                  value={formData.ward}
                  onValueChange={(value) => handleLocationChange("ward", value)}
                  disabled={!formData.district}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {wards.map((ward) => (
                      <SelectItem key={ward.id} value={ward.full_name}>
                        {ward.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div></div>
            </div>
          </div>

          {/* Teaching Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Teaching Information
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Major</label>
              <Input
                value={formData.major}
                onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
                placeholder="Enter major"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Short Description</label>
              <Textarea
                value={formData.shortDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                placeholder="Enter short description"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter full description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Teaching Style</label>
              <Input
                value={formData.teachingStyle}
                onChange={(e) => setFormData(prev => ({ ...prev, teachingStyle: e.target.value }))}
                placeholder="Enter teaching style"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Subjects/Content</label>
              <Input
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter subjects or content areas"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Video Link</label>
              <Input
                value={formData.videoLink}
                onChange={(e) => setFormData(prev => ({ ...prev, videoLink: e.target.value }))}
                placeholder="Enter video introduction link"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditDialogOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateTutor}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Saving...' : 'Update Tutor'}
          </Button>
        </div>
      </Modal>


    </div>
  );
}

export default StaffTutorController; 