export type AccountRole = 'ADMIN' | 'STAFF' | 'TUTOR' | 'USER';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface TutorData {
  avatar?: string;
  major?: string;
  short_description?: string;
  description?: string;
  teaching_style?: string;
  content?: string;
  video_link?: string;
}

export interface Account {
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  gender: string;
  dob: string;
  province: string;
  district: string;
  ward: string;
  avatar?: string;
  status?: AccountStatus | string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  educationLevel?: string;
  role?: AccountRole | string;
  tutorData?: TutorData;
}
