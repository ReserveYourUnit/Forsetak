import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fetchCountries, fetchProfessions } from '../services/catalogService';
import { submitApplication, uploadApplicantFile } from '../services/applicationsService';
import { ApplicantFormData, Country, Profession } from '../types';

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ApplicantFormData>(EMPTY);
  const [countries, setCountries] = useState<Country[]>([]);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchCountries().then(setCountries);
    fetchProfessions().then(setProfessions);
  }, []);

  // اختيار المهنة تلقائيًا لو جاية من صفحة المهنة (?profession=ID)
  useEffect(() => {
    const preselected = searchParams.get('profession');
    if (preselected) setForm((f) => ({ ...f, profession_id: preselected }));
  }, [searchParams]);

  function update<K extends keyof ApplicantFormData>(key: K, value: ApplicantFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const selectedProfession = professions.find((p) => p.id === form.profession_id);
  // Default to requiring a CV until the profession is known, so we never
  // silently skip a document that turns out to be required.
  const cvRequired = selectedProfession ? selectedProfession.requires_cv : true;

  async function onSubmit() {
    if (!form.whatsapp_consent) {
      setError('يجب الموافقة على استخدام رقم WhatsApp للتواصل قبل إرسال الطلب.');
      return;
    }
    if (cvRequired && !cvFile) {
      setError('هذه المهنة تتطلب رفع السيرة الذاتية (CV) قبل إرسال الطلب.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const documents: { cvUrl?: string; passportUrl?: string } = {};

    if (cvFile) {
      setUploadStatus('جاري رفع السيرة الذاتية...');
      const res = await uploadApplicantFile('cvs', cvFile);
      if (!res.ok) {
        setSubmitting(false);
        setUploadStatus(null);
        setError(res.error ?? 'تعذر رفع السيرة الذاتية.');
        return;
      }
      documents.cvUrl = res.path;
    }

    if (passportFile) {
      setUploadStatus('جاري رفع صورة جواز السفر...');
      const res = await uploadApplicantFile('passports', passportFile);
      if (!res.ok) {
        setSubmitting(false);
        setUploadStatus(null);
        setError(res.error ?? 'تعذر رفع صورة جواز السفر.');
        return;
      }
      documents.passportUrl = res.path;
    }

    setUploadStatus('جاري إرسال الطلب...');
    const result = await submitApplication(form, jobId ?? null, documents);
    setSubmitting(false);
    setUploadStatus(null);
    if (!result.ok) {
      setError(result.error ?? 'حدث خطأ غير متوقع.');
      return;
    }
    navigate(`/submitted/${result.applicationNumber}`);
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
            <Toggle label="هل يقبل العمل في دولة أخرى إذا لم تتوفر الدولة الأولى؟" value={form.alt_country_ok} onChange={(v) => update('alt_country_ok', v)} />
          </>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-card">
              <p className="mb-3 text-sm font-bold text-navy">المستندات</p>

              <div className="space-y-3">
                {cvRequired ? (
                  <FileField
                    label="السيرة الذاتية (CV) — مطلوبة لهذه المهنة"
                    file={cvFile}
                    onChange={setCvFile}
                    required
                    accept=".pdf,.doc,.docx,image/*"
                  />
                ) : (
                  <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                    هذه المهنة لا تتطلب رفع سيرة ذاتية (CV).
                  </p>
                )}

                <FileField
                  label="صورة جواز السفر (اختياري)"
                  file={passportFile}
                  onChange={setPassportFile}
                  required={false}
                />
              </div>

              <p className="mt-3 text-[11px] text-slate-400">
                الملفات تُحفظ في مساحة تخزين خاصة (Supabase Storage) غير عامة — لا يطّلع عليها إلا صاحب الطلب وفريق
                الإدارة.
              </p>
            </div>

            <label className="flex items-start gap-2 rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-card">
              <input
                type="checkbox"
                checked={form.whatsapp_consent}
                onChange={(e) => update('whatsapp_consent', e.target.checked)}
                className="mt-1"
              />
              أوافق على استخدام رقم WhatsApp الخاص بي للتواصل معي بخصوص طلبي والفرص الوظيفية المرتبطة به.
            </label>

            <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-700">
              بعد الضغط على استكمال الطلب، سيقوم أحد أعضاء فريق العمل بالتواصل معكم، برجاء عدم غلق هاتفكم.
            </div>
          </div>
        )}

        {uploadStatus && <p className="rounded-xl bg-sky-50 p-3 text-sm text-sky-700">{uploadStatus}</p>}
        {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}

        <div className="flex gap-3 pb-6 pt-2">
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="w-full rounded-2xl bg-navy py-3.5 text-sm font-bold text-white shadow-card"
            >
              التالي
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="w-full rounded-2xl bg-amber py-3.5 text-sm font-bold text-navy shadow-card disabled:opacity-60"
            >
              {submitting ? 'جاري الإرسال...' : 'استكمال الطلب'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  hint
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-600">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-sky focus:outline-none"
      />
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-600">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-sky focus:outline-none"
      >
        <option value="">اختر...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-3 py-3 shadow-card">
      <span className="text-sm text-slate-600">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`h-6 w-11 rounded-full transition ${value ? 'bg-sky' : 'bg-slate-200'}`}
      >
        <span className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition ${value ? '-translate-x-0.5' : '-translate-x-6'}`} />
      </button>
    </div>
  );
}

function FileField({
  label,
  file,
  onChange,
  required,
  accept = 'image/*'
}: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
  required?: boolean;
  accept?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-600">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="w-full rounded-xl border border-dashed border-slate-300 bg-white p-3 text-sm"
      />
      {file && <p className="mt-1 text-[11px] text-emerald-600">تم اختيار: {file.name}</p>}
    </div>
  );
}
