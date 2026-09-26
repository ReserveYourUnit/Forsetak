import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { ApplicantFormData } from '../types';

export interface SubmitApplicationResult {
  ok: boolean;
  applicationNumber?: string;
  error?: string;
}

export async function submitApplication(
  form: ApplicantFormData,
  jobId: string | null,
  documents: { photoUrl?: string; cvUrl?: string; passportUrl?: string }
): Promise<SubmitApplicationResult> {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      error:
        'التطبيق غير متصل بقاعدة بيانات حقيقية بعد. يجب إعداد مشروع Supabase وربط المفاتيح في .env قبل استقبال طلبات حقيقية (راجع README.md).'
    };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'يجب تسجيل الدخول أولًا لإرسال الطلب.' };
  }

  const { data: applicant, error: applicantError } = await supabase
    .from('applicants')
    .upsert(
      {
        user_id: user.id,
        full_name: form.full_name,
        phone: form.phone,
        whatsapp: form.whatsapp,
        address: form.address,
        governorate_id: form.governorate_id,
        area_id: form.area_id,
        birth_date: form.birth_date,
        nationality: form.nationality,
        marital_status: form.marital_status,
        gender: form.gender,
        education: form.education,
        current_job: form.current_job,
        desired_job: form.desired_job,
        profession_id: form.profession_id,
        experience_years: form.experience_years,
        expected_salary: form.expected_salary,
        work_type: form.work_type,
        desired_country_id: form.desired_country_id,
        desired_city: form.desired_city,
        has_passport: form.has_passport,
        passport_number: form.passport_number,
        passport_expiry: form.passport_expiry,
        previous_travel: form.previous_travel,
        previous_work_countries: form.previous_work_countries,
        visa_history: form.visa_history,
        willing_to_relocate: form.alt_country_ok,
        photo_url: documents.photoUrl,
        cv_url: documents.cvUrl,
        passport_url: documents.passportUrl,
        whatsapp_consent: form.whatsapp_consent
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (applicantError || !applicant) {
    return { ok: false, error: applicantError?.message ?? 'تعذر حفظ بيانات المتقدم.' };
  }

  const { data: application, error: applicationError } = await supabase
    .from('applications')
    .insert({
      applicant_id: applicant.id,
      job_id: jobId,
      status: 'awaiting_fee'
    })
    .select('application_number')
    .single();

  if (applicationError || !application) {
    return { ok: false, error: applicationError?.message ?? 'تعذر إنشاء رقم الطلب.' };
  }

  await supabase.functions.invoke('send-whatsapp', {
    body: { applicantId: applicant.id, applicationNumber: application.application_number }
  });

  return { ok: true, applicationNumber: application.application_number };
        }
