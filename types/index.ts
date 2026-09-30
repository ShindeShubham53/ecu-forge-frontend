export type UserRole = 'ADMIN' | 'LEARNER';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  category_id: string;
  category_name?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  duration_hours: number;
  price: number;
  is_published: boolean;
  is_featured: boolean;
  thumbnail_url: string;
  requirements: string[];
  target_audience: string[];
  what_you_will_learn: string[];
  instructor_name: string;
  instructor_title: string;
  created_at: string;
  updated_at: string;
  modules_count?: number;
  lectures_count?: number;
}

export interface LectureResource {
  id: string;
  title: string;
  file_url: string;
  storage_key?: string;
  file_size?: number;
  file_type: 'pdf' | 'doc' | 'code' | 'diagram' | string;
}

export interface Lecture {
  id: string;
  module_id: string;
  title: string;
  description: string;
  order_index: number;
  duration_seconds: number;
  video_stream_id?: string;
  video_url?: string;
  video_status?: 'none' | 'waiting' | 'uploading' | 'processing' | 'ready' | 'errored' | string;
  mux_asset_id?: string;
  mux_playback_id?: string;
  mux_upload_id?: string;
  is_free_preview: boolean;
  resources: LectureResource[];
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  lectures?: Lecture[];
  quizzes?: Quiz[];
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  progress_percent: number;
  is_completed: boolean;
  completed_at?: string;
  course?: Course;
}

export interface LectureProgress {
  id: string;
  user_id: string;
  lecture_id: string;
  last_position_seconds: number;
  watched_percent: number;
  is_completed: boolean;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_option_index?: number;
  explanation?: string;
  order_index: number;
}

export interface Quiz {
  id: string;
  module_id?: string;
  course_id: string;
  title: string;
  description: string;
  passing_percentage: number;
  questions?: QuizQuestion[];
  latest_attempt?: {
    id: string;
    score: number;
    max_score: number;
    percentage: number;
    passed: boolean;
    attempted_at: string;
  } | null;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  attempted_at: string;
  results?: {
    questionId: string;
    correct: boolean;
    correctOptionIndex: number;
    explanation: string;
  }[];
}

export interface Certificate {
  id: string;
  certificate_code: string;
  user_id: string;
  course_id: string;
  user_name: string;
  course_title: string;
  issue_date: string;
  revoked: boolean;
}
