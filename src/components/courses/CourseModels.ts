export interface Course {
  course_id: string;
  tutor_id: string;
  course_name: string;
  introduction_video: string;
  subject: string;
  price?: number;
  course_level: 'Beginner' | 'Intermediate' | 'Advanced';
  tag: string;
  description?: string;
  short_description?: string;
  duration_weeks: number;
  max_students: number;
  current_students: number;
  status: 'Active' | 'Inactive' | 'Draft' | 'Completed';
  created_at: string;
  updated_at: string;
  deleted: boolean;
  tutor?: TutorInfo;
  schedule?: CourseSchedule[];
  sessions?: CourseSession[];
}

export interface TutorInfo {
  tutor_id: string;
  account_id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  major: string;
  rating: number;
}

export interface CourseSchedule {
  schedule_id: string;
  course_id: string;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseSession {
  session_id: string;
  course_id: string;
  session_number: number;
  title: string;
  description?: string;
  scheduled_date: string; // ISO date string
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  meeting_link?: string;
  materials?: string[];
  attendance_count: number;
  created_at: string;
  updated_at: string;
}

export interface CourseFormData {
  course_name: string;
  subject: string;
  course_level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  short_description: string;
  introduction_video: string;
  price: number;
  duration_weeks: number;
  max_students: number;
  tag: string;
  tutor_id: string;
  status: 'Active' | 'Inactive' | 'Draft';
}

export interface ScheduleFormData {
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  course_id: string;
  course_name: string;
  tutor_name: string;
  type: 'course' | 'session';
  status: string;
  color?: string;
}

export interface CalendarView {
  type: 'month' | 'week' | 'day';
  date: Date;
}

export interface TimeSlot {
  hour: number;
  minute: number;
  display: string;
}

export const TIME_SLOTS: TimeSlot[] = [
  { hour: 6, minute: 0, display: '06:00' },
  { hour: 6, minute: 30, display: '06:30' },
  { hour: 7, minute: 0, display: '07:00' },
  { hour: 7, minute: 30, display: '07:30' },
  { hour: 8, minute: 0, display: '08:00' },
  { hour: 8, minute: 30, display: '08:30' },
  { hour: 9, minute: 0, display: '09:00' },
  { hour: 9, minute: 30, display: '09:30' },
  { hour: 10, minute: 0, display: '10:00' },
  { hour: 10, minute: 30, display: '10:30' },
  { hour: 11, minute: 0, display: '11:00' },
  { hour: 11, minute: 30, display: '11:30' },
  { hour: 12, minute: 0, display: '12:00' },
  { hour: 12, minute: 30, display: '12:30' },
  { hour: 13, minute: 0, display: '13:00' },
  { hour: 13, minute: 30, display: '13:30' },
  { hour: 14, minute: 0, display: '14:00' },
  { hour: 14, minute: 30, display: '14:30' },
  { hour: 15, minute: 0, display: '15:00' },
  { hour: 15, minute: 30, display: '15:30' },
  { hour: 16, minute: 0, display: '16:00' },
  { hour: 16, minute: 30, display: '16:30' },
  { hour: 17, minute: 0, display: '17:00' },
  { hour: 17, minute: 30, display: '17:30' },
  { hour: 18, minute: 0, display: '18:00' },
  { hour: 18, minute: 30, display: '18:30' },
  { hour: 19, minute: 0, display: '19:00' },
  { hour: 19, minute: 30, display: '19:30' },
  { hour: 20, minute: 0, display: '20:00' },
  { hour: 20, minute: 30, display: '20:30' },
  { hour: 21, minute: 0, display: '21:00' },
  { hour: 21, minute: 30, display: '21:30' },
  { hour: 22, minute: 0, display: '22:00' },
];

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun', full: 'Sunday' },
  { value: 1, label: 'Monday', short: 'Mon', full: 'Monday' },
  { value: 2, label: 'Tuesday', short: 'Tue', full: 'Tuesday' },
  { value: 3, label: 'Wednesday', short: 'Wed', full: 'Wednesday' },
  { value: 4, label: 'Thursday', short: 'Thu', full: 'Thursday' },
  { value: 5, label: 'Friday', short: 'Fri', full: 'Friday' },
  { value: 6, label: 'Saturday', short: 'Sat', full: 'Saturday' },
];

export const COURSE_LEVELS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];

export const COURSE_STATUSES = [
  { value: 'Active', label: 'Active', color: 'green' },
  { value: 'Inactive', label: 'Inactive', color: 'gray' },
  { value: 'Draft', label: 'Draft', color: 'yellow' },
  { value: 'Completed', label: 'Completed', color: 'blue' },
]; 