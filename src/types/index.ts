export interface Country {
  id: string;
  name: string;
  region: 'arab' | 'europe' | 'other';
  flag_url: string;
  active: boolean;
  featured: boolean;
  description?: string;
}

export interface Profession {
  id: string;
  name: string;
  category: string;
  active: boolean;
}

export interface Job {
  id: string;
  title: string;
  company_name: string;
  company_logo_url?: string;
  profession_id: string;
  country: Pick<Country, 'id' | 'name' | 'flag_url'>;
  city: string;
  vacancies: number;
  salary_min: number;
  salary_max: number;
  currency: string;
  contract_type: string;
  working_hours?: string;
  experience?: string;
  education?: string;
  accommodation: boolean;
  insurance: boolean;
  flight_ticket: boolean;
  visa_support: boolean;
  description: string;
  requirements: string[];
  benefits: string[];
  interview_method?: string;
  status: 'pending' | 'published' | 'closed' | 'rejected';
  published_at?: string;
  expires_at?: string;
}

export type ApplicationStatus =
  | 'new'
  | 'awaiting_fee'
  | 'receipt_uploaded'
  | 'payment_review'
  | 'payment_confirmed'
  | 'under_review'
  | 'data_reviewed'
  | 'opportunity_found'
  | 'nominated'
  | 'employer_contacted'
  | 'awaiting_employer_reply'
  | 'accepted'
  | 'rejected'
  | 'closed';

export const APPLICATION_STATUS_LABELS_AR: Record<ApplicationStatus, string> = {
  new: 'طلب جديد',
  awaiting_fee: 'في انتظار دفع رسوم الاستمارة',
  receipt_uploaded: 'تم رفع إيصال الدفع',
  payment_review: 'الدفع قيد المراجعة',
  payment_confirmed: 'تم تأكيد الدفع',
  under_review: 'الطلب قيد المراجعة',
  data_reviewed: 'تمت مراجعة البيانات',
  opportunity_found: 'توجد فرصة مناسبة',
  nominated: 'تم ترشيح المتقدم',
  employer_contacted: 'تم التواصل مع جهة العمل',
  awaiting_employer_reply: 'في انتظار رد جهة العمل',
  accepted: 'تم قبول الترشيح',
  rejected: 'تم رفض الترشيح',
  closed: 'تم إغلاق الطلب'
};

export interface ApplicantFormData {
  full_name: string;
  phone: string;
  whatsapp: string;
  address: string;
  governorate_id: string;
  area_id: string;
  birth_date: string;
  nationality: string;
  marital_status: string;
  gender: 'male' | 'female';
  education: string;
  email?: string;

  current_job: string;
  desired_job: string;
  profession_id: string;
  experience_years: number;
  experience_location?: string;
  expected_salary?: number;
  work_type: string;
  shift_work_ok: boolean;
  relocation_ok: boolean;

  desired_country_id: string;
  desired_city?: string;
  has_passport: boolean;
  passport_number?: string;
  passport_expiry?: string;
  previous_travel: boolean;
  previous_work_countries?: string;
  visa_history: boolean;
  alt_country_ok: boolean;

  whatsapp_consent: boolean;
}
