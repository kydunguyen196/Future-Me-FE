import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { default as Link } from "@/components/ui/CustomLink"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, XCircle } from "lucide-react";
import axios from 'axios';
import { useAppDispatch } from '@/redux/hooks';
import { registerUser } from '@/redux/thunks/authThunks';
import { toast } from 'react-toastify'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { InteractiveHoverButton } from '@/components/ui/magic/InteractiveHoverButton';

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

// Define form data interface
interface FormData {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  password: string;
  confirmPassword: string;
  email: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  educationLevel: string;
  agreeTerms: boolean;
}

// Define errors interface matching form data fields
interface FormErrors {
  [key: string]: string;
}

export function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // Load language from localStorage on component mount
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en';
    if (i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);
  

  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    password: "",
    confirmPassword: "",
    email: "",
    phoneNumber: "",
    province: "",
    district: "",
    ward: "",
    educationLevel: "",
    agreeTerms: false
  });
  
  // Error state
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Location data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  
  // Fetch province data on component mount
  useEffect(() => {
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
      setFormErrors(prev => ({
        ...prev,
        province: t("register.errors.provinceLoad")
      }));
    }
  };
  
  // Handle form field changes
  const handleChange = (name: string, value: string | boolean) => {
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
    
    // Clear error for the changed field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };
  
  // Validate the form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    // Validate firstName
    if (!formData.firstName) {
      errors.firstName = t("register.errors.firstName.required");
    } else if (!/^[\p{L}\s]+$/u.test(formData.firstName)) {
      errors.firstName = t("register.errors.firstName.format");
    }
    
    // Validate lastName
    if (!formData.lastName) {
      errors.lastName = t("register.errors.lastName.required");
    } else if (!/^[\p{L}\s]+$/u.test(formData.lastName)) {
      errors.lastName = t("register.errors.lastName.format");
    }
    
    // Validate email
    if (!formData.email) {
      errors.email = t("register.errors.email.required");
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = t("register.errors.email.format");
    }
    
    // Validate phoneNumber - Vietnamese phone numbers only
    if (!formData.phoneNumber) {
      errors.phoneNumber = t("register.errors.phoneNumber.required");
    } else if (!/^(03|05|07|08|09)\d{8}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = t("register.errors.phoneNumber.format");
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = t("register.errors.password.required");
    } else if (
      formData.password.length < 8 ||
      !/[A-Z]/.test(formData.password) ||
      !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(formData.password) ||
      /\s/.test(formData.password)
    ) {
      errors.password = t("register.errors.password.format");
    }
    
    // Validate confirmPassword
    if (!formData.confirmPassword) {
      errors.confirmPassword = t("register.errors.confirmPassword.required");
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t("register.errors.confirmPassword.match");
    }
    
    // Validate DOB
    if (!formData.dob) {
      errors.dob = t("register.errors.dob.required");
    } else {
      const birthDate = new Date(formData.dob);
      const currentDate = new Date();
      const minYear = 1950;
      const birthYear = birthDate.getFullYear();
      const age = currentDate.getFullYear() - birthYear;

      if (birthYear < minYear) {
        errors.dob = t("register.errors.dob.minYear", { year: minYear });
      } else if (age < 10) {
        errors.dob = t("register.errors.dob.minAge");
      }
    }
    
    // Validate gender
    if (!formData.gender) {
      errors.gender = t("register.errors.gender");
    }
    
    // Validate location fields
    if (!formData.province) {
      errors.province = t("register.errors.province");
    }
    
    if (!formData.district) {
      errors.district = t("register.errors.district");
    }
    
    if (!formData.ward) {
      errors.ward = t("register.errors.ward");
    }
    
    // Validate educationLevel - always required for students
    if (!formData.educationLevel) {
      errors.educationLevel = t("register.errors.educationLevel");
    }
    
    // Validate terms agreement
    if (!formData.agreeTerms) {
      errors.agreeTerms = t("register.errors.terms");
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsLoading(true);
        
        // Prepare data for submission - always use student role
        const submitData = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          phone: formData.phoneNumber,
          address: `${formData.ward}, ${formData.district}, ${formData.province}`,
          gender: formData.gender,
          dob: formData.dob,
          role: "student",
          education: formData.educationLevel,
        };
        
        // Dispatch register action
        await dispatch(registerUser(submitData)).unwrap();
        
        // Show success message
        toast.success(t("register.successMessage"));
        
        // Navigate to home page
        navigate("/");
      } catch (error: any) {
        console.error('Registration error:', error);
        setFormErrors(prev => ({
          ...prev,
          general: error?.message || error || t("register.errors.general")
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Calculate max and min dates for date of birth input
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 10);
  const maxDateString = maxDate.toISOString().split('T')[0];
  const minDateString = '1950-01-01';
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 relative bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher className="transition-all duration-200 hover:scale-105 active:scale-95" />
      </div>
      
      <div className="w-full max-w-4xl space-y-6 relative z-10">
        {/* Logo */}
        <div className="text-center">
          <Link 
            to="/"
            className="inline-block transition-transform duration-200 hover:scale-105"
          >
            <img
              src={`${import.meta.env.VITE_ASSETS_URL}/assets/images/header_logo.png`}
              alt="FutureMe Logo"
              className="h-10 w-auto mx-auto object-contain cursor-pointer"
            />
          </Link>
        </div>
        
        <Card className="relative overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl border border-white/30 dark:border-gray-700/30">
          <CardHeader className="text-center py-6">
            <CardTitle className="text-2xl font-bold">{t("register.title")}</CardTitle>
            <CardDescription className="text-sm mt-2">
              {t("register.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    {t("register.personalInfo", "Personal Information")}
                  </h3>
                  
                  {/* First and Last Name Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">{t("register.firstName")}</Label>
                      <Input
                        id="firstName"
                        placeholder={t("register.firstNamePlaceholder")}
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        className={`h-10 ${formErrors.firstName ? "border-red-500" : ""}`}
                      />
                      {formErrors.firstName && (
                        <p className="text-xs text-red-500">{formErrors.firstName}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">{t("register.lastName")}</Label>
                      <Input
                        id="lastName"
                        placeholder={t("register.lastNamePlaceholder")}
                        value={formData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        className={`h-10 ${formErrors.lastName ? "border-red-500" : ""}`}
                      />
                      {formErrors.lastName && (
                        <p className="text-xs text-red-500">{formErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Email and Phone Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">{t("register.email")}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("register.emailPlaceholder")}
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className={`h-10 ${formErrors.email ? "border-red-500" : ""}`}
                      />
                      {formErrors.email && (
                        <p className="text-xs text-red-500">{formErrors.email}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-sm font-medium">{t("register.phoneNumber")}</Label>
                      <Input
                        id="phoneNumber"
                        placeholder={t("register.phoneNumberPlaceholder")}
                        value={formData.phoneNumber}
                        onChange={(e) => handleChange("phoneNumber", e.target.value)}
                        className={`h-10 ${formErrors.phoneNumber ? "border-red-500" : ""}`}
                      />
                      {formErrors.phoneNumber && (
                        <p className="text-xs text-red-500">{formErrors.phoneNumber}</p>
                      )}
                    </div>
                  </div>

                  {/* Date of Birth and Gender Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dob" className="text-sm font-medium">{t("register.dob")}</Label>
                      <Input
                        id="dob"
                        type="date"
                        max={maxDateString}
                        min={minDateString}
                        value={formData.dob}
                        onChange={(e) => handleChange("dob", e.target.value)}
                        className={`h-10 ${formErrors.dob ? "border-red-500" : ""}`}
                      />
                      {formErrors.dob && (
                        <p className="text-xs text-red-500">{formErrors.dob}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-medium">{t("register.gender")}</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value: string) => handleChange("gender", value)}
                      >
                        <SelectTrigger className={`w-full h-10 ${formErrors.gender ? "border-red-500" : ""}`}>
                          <SelectValue placeholder={t("register.genderPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{t("register.gender.male")}</SelectItem>
                          <SelectItem value="female">{t("register.gender.female")}</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.gender && (
                        <p className="text-xs text-red-500">{formErrors.gender}</p>
                      )}
                    </div>
                  </div>

                  {/* Education Level */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="educationLevel" className="text-sm font-medium">{t("register.educationLevel")}</Label>
                      <Select
                        value={formData.educationLevel}
                        onValueChange={(value: string) => handleChange("educationLevel", value)}
                      >
                        <SelectTrigger className={`w-full h-10 ${formErrors.educationLevel ? "border-red-500" : ""}`}>
                          <SelectValue placeholder={t("register.educationLevelPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Secondary School">{t("register.educationLevel.secondary")}</SelectItem>
                          <SelectItem value="High School">{t("register.educationLevel.high")}</SelectItem>
                          <SelectItem value="College">{t("register.educationLevel.college")}</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.educationLevel && (
                        <p className="text-xs text-red-500">{formErrors.educationLevel}</p>
                      )}
                    </div>
                    <div></div>
                  </div>
                </div>

                {/* Security Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    {t("register.security", "Security")}
                  </h3>
                  
                  {/* Password fields side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        {t("register.password")}
                        <span className="text-xs text-gray-500 ml-1" title={t("register.passwordHint")}>
                          (?)
                        </span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t("register.passwordPlaceholder")}
                          value={formData.password}
                          onChange={(e) => handleChange("password", e.target.value)}
                          className={`h-10 pr-10 ${formErrors.password ? "border-red-500" : ""}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-10 w-10 px-0 focus:ring-0 focus:ring-offset-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                      {formErrors.password && (
                        <p className="text-xs text-red-500">{formErrors.password}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">{t("register.confirmPassword")}</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder={t("register.confirmPasswordPlaceholder")}
                          value={formData.confirmPassword}
                          onChange={(e) => handleChange("confirmPassword", e.target.value)}
                          className={`h-10 pr-10 ${formErrors.confirmPassword ? "border-red-500" : ""}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-10 w-10 px-0 focus:ring-0 focus:ring-offset-0"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="text-xs text-red-500">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    {t("register.location", "Location")}
                  </h3>
                  
                  {/* Province and District Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="province" className="text-sm font-medium">{t("register.province")}</Label>
                      <Select
                        value={formData.province}
                        onValueChange={(value: string) => handleChange("province", value)}
                      >
                        <SelectTrigger className={`w-full h-10 ${formErrors.province ? "border-red-500" : ""}`}>
                          <SelectValue placeholder={t("register.provincePlaceholder")} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {provinces.map((province) => (
                            <SelectItem key={province.id} value={province.full_name}>
                              {province.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.province && (
                        <p className="text-xs text-red-500">{formErrors.province}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="district" className="text-sm font-medium">{t("register.district")}</Label>
                      <Select
                        value={formData.district}
                        onValueChange={(value: string) => handleChange("district", value)}
                        disabled={!formData.province}
                      >
                        <SelectTrigger className={`w-full h-10 ${formErrors.district ? "border-red-500" : ""}`}>
                          <SelectValue placeholder={t("register.districtPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {districts.map((district) => (
                            <SelectItem key={district.id} value={district.full_name}>
                              {district.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.district && (
                        <p className="text-xs text-red-500">{formErrors.district}</p>
                      )}
                    </div>
                  </div>

                  {/* Ward */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ward" className="text-sm font-medium">{t("register.ward")}</Label>
                      <Select
                        value={formData.ward}
                        onValueChange={(value: string) => handleChange("ward", value)}
                        disabled={!formData.district}
                      >
                        <SelectTrigger className={`w-full h-10 ${formErrors.ward ? "border-red-500" : ""}`}>
                          <SelectValue placeholder={t("register.wardPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {wards.map((ward) => (
                            <SelectItem key={ward.id} value={ward.full_name}>
                              {ward.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.ward && (
                        <p className="text-xs text-red-500">{formErrors.ward}</p>
                      )}
                    </div>
                    <div></div>
                  </div>
                </div>

                {/* Terms and Submit Section */}
                <div className="space-y-4">
                  {/* Terms agreement */}
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="agreeTerms" 
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) => handleChange("agreeTerms", checked === true)}
                        className="mt-0.5"
                      />
                      <Label htmlFor="agreeTerms" className="text-sm leading-relaxed cursor-pointer">
                        {t("register.terms")}
                      </Label>
                    </div>
                    {formErrors.agreeTerms && (
                      <p className="text-xs text-red-500">{formErrors.agreeTerms}</p>
                    )}
                  </div>
                  
                  {/* General error */}
                  {formErrors.general && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded border border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.general}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Submit button */}
                  <InteractiveHoverButton 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-10"
                  >
                    {isLoading ? t("register.loading") : t("register.submit")}
                  </InteractiveHoverButton>
                  
                  <div className="text-center text-sm">
                    {t("auth.register.haveAccount")}{" "}
                    <Link to="/auth/login" className="underline underline-offset-4 text-blue-600 hover:text-blue-800">
                      {t("register.loginLink")}
                    </Link>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
          {t('auth.login.termsPrefix')}{" "}
          <a href="#">{t('auth.login.termsOfService')}</a>{" "}
          {t('auth.login.termsAnd')}{" "}
          <a href="#">{t('auth.login.privacyPolicy')}</a>.
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
