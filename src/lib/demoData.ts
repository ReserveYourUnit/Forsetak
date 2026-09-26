// ⚠️ DEMO DATA ONLY.
import { Country, Job, Profession } from '../types';

export const DEMO_COUNTRIES: Country[] = [
  { id: 'de', name: 'ألمانيا', region: 'europe', flag_url: '🇩🇪', active: true, featured: true },
  { id: 'ae', name: 'الإمارات', region: 'arab', flag_url: '🇦🇪', active: true, featured: true },
  { id: 'sa', name: 'السعودية', region: 'arab', flag_url: '🇸🇦', active: true, featured: true },
  { id: 'qa', name: 'قطر', region: 'arab', flag_url: '🇶🇦', active: true, featured: false },
  { id: 'kw', name: 'الكويت', region: 'arab', flag_url: '🇰🇼', active: true, featured: false },
  { id: 'bh', name: 'البحرين', region: 'arab', flag_url: '🇧🇭', active: true, featured: false },
  { id: 'om', name: 'عمان', region: 'arab', flag_url: '🇴🇲', active: true, featured: false },
  { id: 'jo', name: 'الأردن', region: 'arab', flag_url: '🇯🇴', active: true, featured: false },
  { id: 'nl', name: 'هولندا', region: 'europe', flag_url: '🇳🇱', active: true, featured: false },
  { id: 'fr', name: 'فرنسا', region: 'europe', flag_url: '🇫🇷', active: true, featured: false },
  { id: 'it', name: 'إيطاليا', region: 'europe', flag_url: '🇮🇹', active: true, featured: false },
  { id: 'es', name: 'إسبانيا', region: 'europe', flag_url: '🇪🇸', active: true, featured: false },
  { id: 'se', name: 'السويد', region: 'europe', flag_url: '🇸🇪', active: true, featured: false }
];

export const DEMO_PROFESSIONS: Profession[] = [
  { id: 'electrician', name: 'كهربائي', category: 'فني', active: true },
  { id: 'plumber', name: 'سباك', category: 'فني', active: true },
  { id: 'carpenter', name: 'نجار', category: 'فني', active: true },
  { id: 'driver', name: 'سائق', category: 'خدمات', active: true },
  { id: 'chef', name: 'طباخ', category: 'ضيافة', active: true },
  { id: 'production', name: 'عامل إنتاج', category: 'صناعة', active: true },
  { id: 'nurse', name: 'ممرض/ة', category: 'طبي', active: true },
  { id: 'hvac', name: 'فني تكييف وتبريد', category: 'فني', active: true },
  { id: 'security', name: 'حارس أمن', category: 'خدمات', active: true },
  { id: 'accountant', name: 'محاسب', category: 'إداري', active: true }
];

export const DEMO_JOBS: Job[] = [
  {
    id: 'demo-1',
    title: 'عامل إنتاج',
    company_name: 'BMW (بيانات تجريبية)',
    profession_id: 'production',
    country: { id: 'de', name: 'ألمانيا', flag_url: '🇩🇪' },
    city: 'ميونخ',
    vacancies: 12,
    salary_min: 1500,
    salary_max: 2500,
    currency: 'EUR',
    contract_type: 'عقد عمل دائم',
    working_hours: '8 ساعات / يوم، نظام ورديات',
    experience: 'سنة خبرة أو أكثر (يفضل)',
    education: 'مؤهل متوسط',
    accommodation: true,
    insurance: true,
    flight_ticket: true,
    visa_support: true,
    description: 'العمل على خطوط الإنتاج في مصنع BMW وفق معايير السلامة والجودة.',
    requirements: ['خبرة سابقة في نفس المجال (يفضل)', 'إجادة اللغة الإنجليزية (مستوى مقبول)', 'اللياقة البدنية والاستعداد للعمل بنظام ورديات'],
    benefits: ['سكن مدعوم', 'تأمين صحي', 'تذكرة سفر', 'دعم التأشيرة'],
    status: 'published',
    published_at: '2026-09-01'
  },
  {
    id: 'demo-2',
    title: 'طباخ',
    company_name: 'Hilton Hotels (بيانات تجريبية)',
    profession_id: 'chef',
    country: { id: 'ae', name: 'الإمارات', flag_url: '🇦🇪' },
    city: 'دبي',
    vacancies: 5,
    salary_min: 1200,
    salary_max: 1800,
    currency: 'USD',
    contract_type: 'عقد عمل دائم',
    accommodation: true,
    insurance: true,
    flight_ticket: true,
    visa_support: true,
    description: 'إعداد الأطباق ضمن فريق المطبخ في فندق فئة خمس نجوم.',
    requirements: ['خبرة لا تقل عن سنتين', 'شهادة صحة وسلامة غذاء (يفضل)'],
    benefits: ['سكن', 'تأمين', 'تذاكر سفر سنوية'],
    status: 'published',
    published_at: '2026-09-05'
  },
  {
    id: 'demo-3',
    title: 'حارس أمن',
    company_name: 'Almarai (بيانات تجريبية)',
    profession_id: 'security',
    country: { id: 'sa', name: 'السعودية', flag_url: '🇸🇦' },
    city: 'الرياض',
    vacancies: 8,
    salary_min: 800,
    salary_max: 1200,
    currency: 'USD',
    contract_type: 'عقد عمل دائم',
    accommodation: true,
    insurance: true,
    flight_ticket: false,
    visa_support: true,
    description: 'تأمين مرافق الشركة والإشراف على الدخول والخروج وفق الأنظمة المعتمدة.',
    requirements: ['اللياقة البدنية', 'عدم وجود سوابق جنائية'],
    benefits: ['سكن', 'تأمين صحي'],
    status: 'published',
    published_at: '2026-09-10'
  }
];
