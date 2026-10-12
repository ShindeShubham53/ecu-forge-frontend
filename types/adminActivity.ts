// Response of GET /admin/users/:id/activity (read-only admin learner view).

export interface Page<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PaymentPayload {
  payment_record_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  order_created_at: string;
}

export interface PaymentItem extends PaymentPayload {
  course_id: string;
  course_title: string;
  status: string;
  state: 'captured' | 'order_created' | 'unknown';
  counted_as_purchase: boolean;
  possible_duplicate: boolean;
}

export interface CoursePurchase {
  course_id: string;
  course_title: string | null;
  course_price: number | null;
  enrolled: boolean;
  enrolled_at: string | null;
  enrollment_type: 'paid' | 'free' | 'no_matching_payment' | 'not_enrolled';
  enrollment_payment_reference: string | null;
  has_access: boolean;
  purchase_payment: PaymentPayload | null;
  duplicate_captured_payments: PaymentPayload[];
  unconfirmed_orders: number;
  flags: string[];
}

export interface LectureActivity {
  lecture_id: string;
  title: string;
  module_title: string;
  duration_seconds: number;
  started: boolean;
  is_completed: boolean;
  last_position_seconds: number | null;
  watched_percent: number | null;
  verified_watch_seconds: number | null;
  last_updated_at: string | null;
}

export interface CourseProgress {
  course_id: string;
  course_title: string;
  total_lectures: number;
  completed_lectures: number;
  progress_percent: number;
  lectures_complete: boolean;
  stored_progress_percent: number;
  stored_is_completed: boolean;
  completed_at: string | null;
  last_progress_update_at: string | null;
  has_quiz: boolean;
  quiz: { quiz_id: string; title: string; passing_percentage: number; passed: boolean } | null;
  certificate_eligible: boolean;
  certificate_eligibility_reason: string | null;
  certificate: { certificate_code: string; revoked: boolean } | null;
  lectures: LectureActivity[];
}

export interface QuizAttemptItem {
  attempt_id: string;
  quiz_id: string;
  quiz_title: string;
  course_id: string;
  course_title: string;
  attempted_at: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  current_passing_percentage: number;
}

export interface QuizSummary {
  quiz_id: string;
  quiz_title: string | null;
  course_id: string | null;
  course_title: string | null;
  attempts: number;
  best_percentage: number | null;
  passed_any_attempt: boolean;
  last_attempt_at: string | null;
}

export interface CertificateItem {
  id: string;
  certificate_code: string;
  course_id: string;
  course_title: string;
  name_on_certificate: string;
  issue_date: string;
  revoked: boolean;
  status: 'valid' | 'revoked';
  course_lectures_complete: boolean | null;
}

export interface LearnerActivity {
  profile: {
    id: string;
    full_name: string;
    email: string;
    role: 'ADMIN' | 'LEARNER';
    status: string;
    is_deleted_account: boolean;
    created_at: string;
    last_login_at: null;
    last_recorded_activity: { at: string; source: string } | null;
  };
  overview: {
    enrolled_courses: number;
    successful_purchases: number;
    amount_paid_by_currency: Record<string, number>;
    duplicate_captured_payments: number;
    duplicate_amount_by_currency: Record<string, number>;
    payment_records: { captured: number; order_created_unconfirmed: number; unknown_status: number };
    overall_progress_percent: number;
    overall_completed_lectures: number;
    overall_total_lectures: number;
    completed_courses: number;
    quiz_attempts: number;
    certificates_total: number;
    certificates_valid: number;
    certificates_revoked: number;
  };
  purchases: CoursePurchase[];
  course_progress: CourseProgress[];
  quiz_summary: QuizSummary[];
  certificates: CertificateItem[];
  payments: Page<PaymentItem>;
  quiz_attempts: Page<QuizAttemptItem>;
  not_recorded: string[];
}
