import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { ApplicantFormData } from '../types';

export interface SubmitApplicationResult {
  ok: boolean;
  applicationNumber?: string;
  error?: string;
}

/**
 * Uploads one applicant file (photo / cv / passport) to its private Storage
 * bucket under the signed-in user's folder, per the RLS path convention
 * (<user_id>/<filename>). Returns the storage path on success, or null on
 * failure (never fakes a successful upload).
 */
export async function uploadApplicantFile(
  bucket: 'applicant-photos' | 'cvs' | 'passports',
  file: File
): Promise<{ ok: boolean; path?: string; error?: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: 'التطبيق غير متصل بقاعدة بيانات حقيقية بعد.' };
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'يجب تسجيل الدخول أولًا.' };
  }
  const safeName = file.name.replace(/[^\w.\-]+/g, '_');
  const path = `${user.id}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, path };
}

/**
 * Creates the applicant row + application row inside Supabase, then invokes
 * the `send-whatsapp` Edge Function to queue the confirmation message.
 *
 * IMPORTANT: this function does not run against a real database until
 * Supabase is configured (see README.md). Until then it returns ok:false
 * with a clear error instead of pretending the submission succeeded —
 * per the project rules, we never fabricate a successful submission,
 * payment, or WhatsApp send.
 */
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

  // application_number is generated server-side by a Postgres function
  // (generate_application_number) via a BEFORE INSERT trigger — see
  // supabase/schema.sql — so two concurrent submissions can never collide.
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

  // Fire-and-forget: queue the WhatsApp confirmation. This never claims
  // success to the caller — the Edge Function itself records
  // "pending_whatsapp" unless real Meta credentials are configured.
  await supabase.functions.invoke('send-whatsapp', {
    body: { applicantId: applicant.id, applicationNumber: application.application_number }
  });

  return { ok: true, applicationNumber: application.application_number };
}
