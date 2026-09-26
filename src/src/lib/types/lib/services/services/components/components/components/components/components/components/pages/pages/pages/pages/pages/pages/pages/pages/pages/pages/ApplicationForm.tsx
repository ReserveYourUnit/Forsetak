import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCountries, fetchProfessions } from '../services/catalogService';
import { submitApplication } from '../services/applicationsService';
import { ApplicantFormData } from '../types';
import { useEffect } from 'react';
import { Country, Profession } from '../types';

const EMPTY: ApplicantFormData = {
  full_name: '',
  phone: '',
  whatsapp: '',
  address: '',
  governorate_id: '',
  area_id: '',
  birth_date: '',
  nationality: 'مصري',
  marital_status: 'أعزب',
  gender: 'male',
  education: '',
  current_job: '',
  desired_job: '',
  profession_id: '',
  experience_years: 0,
  work_type: 'دوام كامل',
  shift_work_ok: true,
  relocation_ok: true,
  desired_country_id: '',
  has_passport: false,
  previous_travel: false,
  visa_history: false,
  alt_country_ok: true,
  whatsapp_consent: false
};

const STEPS = ['البيانات الشخصية', 'بيانات العمل', 'بيانات السفر', 'المستندات والمراجعة'];

export default function ApplicationForm() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ApplicantFormData>(EMPTY);
  const [countries, setCountries] = useState<Country[]>([]);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCountries().then(setCountries);
    fetchProfessions().then(setProfessions);
  }, []);

  function update<K extends keyof ApplicantFormData>(key: K, value: ApplicantFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit() {
    if (!form.whatsapp_consent) {
      setError('يجب الموافقة على استخدام رقم WhatsApp للتواصل قبل إرسال الطلب.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await submitApplication(form, jobId ?? null, {});
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? 'حدث خطأ غير متوقع.');
      return;
    }
    navigate(`/payment/${result.applicationNumber}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="flex items-center gap-3 bg-navy px-4 py-4 text-white">
        <button onClick={() => (step === 0 ? navigate(-1) : setStep((s) => s - 1))} aria-label="رجوع">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">{STEPS[step]}</h1>
      </div>

      <div className="mx-4 mt-3 flex gap-1.5">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-sky' : 'bg-slate-200'}`} />
        ))}
      </div>

      <div className="mx-4 mt-5 space-y-4">
        {step === 0 && (
          <>
            <Field label="الاسم بالكامل" value={form.full_name} onChange={(v) => update('full_name', v)} required />
            <Field label="رقم الهاتف" value={form.phone} onChange={(v) => update('phone', v)} required type="tel" />
            <Field label="رقم WhatsApp" value={form.whatsapp} onChange={(v) => update('whatsapp', v)} required type="tel" />
            <Field label="العنوان بالتفصيل" value={form.address} onChange={(v) => update('address', v)} required />
            <Field label="المحافظة" value={form.governorate_id} onChange={(v) => update('governorate_id', v)} required
              hint="تُملأ من قائمة محافظات مصر المرتبطة بجدول governorates في Supabase" />
            <Field label="المنطقة / المركز" value={form.area_id} onChange={(v) => update('area_id', v)} required
              hint="تُملأ تلقائيًا حسب المحافظة المختارة من جدول areas" />
            <Field label="تاريخ الميلاد" value={form.birth_date} onChange={(v) => update('birth_date', v)} required type="date" />
            <Field label="الحالة الاجتماعية" value={form.marital_status} onChange={(v) => update('marital_status', v)} required />
            <Field label="المؤهل الدراسي" value={form.education} onChange={(v) => update('education', v)} required />
            <Field label="البريد الإلكتروني (اختياري)" value={form.email ?? ''} onChange={(v) => update('email', v)} type="email" />
          </>
        )}

        {step === 1 && (
          <>
            <Field label="المهنة الحالية" value={form.current_job} onChange={(v) => update('current_job', v)} required />
            <SelectField
              label="المهنة المطلوبة"
              value={form.profession_id}
              onChange={(v) => update('profession_id', v)}
              options={professions.map((p) => ({ value: p.id, label: p.name }))}
              required
            />
            <Field
              label="سنوات الخبرة"
              value={String(form.experience_years)}
              onChange={(v) => update('experience_years', Number(v) || 0)}
              type="number"
              required
            />
            <Field label="الراتب المتوقع" value={String(form.expected_salary ?? '')} onChange={(v) => update('expected_salary', Number(v) || undefined)} type="number" />
            <Toggle label="هل يقبل العمل بنظام الورديات؟" value={form.shift_work_ok} onChange={(v) => update('shift_work_ok', v)} />
            <Toggle label="هل يقبل العمل خارج محل إقامته؟" value={form.relocation_ok} onChange={(v) => update('relocation_ok', v)} />
          </>
        )}

        {step === 2 && (
          <>
            <SelectField
              label="الدولة التي يرغب بالسفر إليها"
              value={form.desired_country_id}
              onChange={(v) => update('desired_country_id', v)}
              options={countries.map((c) => ({ value: c.id, label: `${c.flag_url} ${c.name}` }))}
              required
            />
            <Field label="المدينة المفضلة (إن وجدت)" value={form.desired_city ?? ''} onChange={(v) => update('desired_city', v)} />
            <Toggle label="هل لديه جواز سفر؟" value={form.has_passport} onChange={(v) => update('has_passport', v)} />
            {form.has_passport && (
              <Field label="تاريخ انتهاء جواز السفر" value={form.passport_expiry ?? ''} onChange={(v) => update('passport_expiry', v)} type="date" />
            )}
            <Toggle label="هل سبق له السفر؟" value={form.previous_travel} onChange={(v) => update('previous_travel', v)} />
            <Toggle label="هل يقبل العمل في دولة أخرى إذا لم تتوفر الدولة الأولى؟" value={form.alt_country_ok} on
