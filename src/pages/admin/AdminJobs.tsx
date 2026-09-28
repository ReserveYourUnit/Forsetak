import { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { supabase } from '../../lib/supabaseClient';
import { Country, Profession } from '../../types';

interface JobRow {
  id: string;
  title: string;
  status: string;
  city_name: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  company: { name: string } | null;
  country: { name: string; flag_url: string } | null;
}

interface CompanyOpt {
  id: string;
  name: string;
}

const EMPTY = {
  company_id: '',
  title: '',
  profession_id: '',
  country_id: '',
  city_name: '',
  vacancies: '1',
  salary_min: '',
  salary_max: '',
  currency: 'USD',
  contract_type: 'عقد عمل دائم',
  working_hours: '',
  experience: '',
  education: '',
  accommodation: false,
  insurance: false,
  flight_ticket: false,
  visa_support: false,
  description: '',
  requirements: '',
  benefits: ''
};

const STATUS_AR: Record<string, string> = {
  published: 'منشورة',
  pending: 'قيد المراجعة',
  closed: 'مغلقة',
  rejected: 'مرفوضة'
};

const lines = (v: string) =>
  v
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

export default function AdminJobs() {
  const [rows, setRows] = useState<JobRow[]>([]);
  const [companies, setCompanies] = useState<CompanyOpt[]>([]);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, status, city_name, salary_min, salary_max, currency, company:companies(name), country:countries(name, flag_url)')
      .order('created_at', { ascending: false });
    if (error) {
      setMsg(error.message);
      return;
    }
    setRows((data ?? []) as unknown as JobRow[]);
  }

  useEffect(() => {
    load();
    supabase
      .from('companies')
      .select('id, name')
      .eq('verification_status', 'approved')
      .order('name')
      .then(({ data }) => setCompanies((data ?? []) as CompanyOpt[]));
    supabase
      .from('professions')
      .select('*')
      .eq('active', true)
      .order('name')
      .then(({ data }) => setProfessions((data ?? []) as Profession[]));
    supabase
      .from('countries')
      .select('*')
      .eq('active', true)
      .order('name')
      .then(({ data }) => setCountries((data ?? []) as Country[]));
  }, []);

  function set(key: keyof typeof EMPTY, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function add() {
    if (!form.company_id || !form.title.trim() || !form.country_id) {
      setMsg('اختر الشركة واكتب اسم الوظيفة واختر الدولة.');
      return;
    }
    const { error } = await supabase.from('jobs').insert({
      company_id: form.company_id,
      title: form.title.trim(),
      profession_id: form.profession_id || null,
      country_id: form.country_id,
      city_name: form.city_name.trim() || null,
      vacancies: Number(form.vacancies) || 1,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      currency: form.currency,
      contract_type: form.contract_type.trim() || null,
      working_hours: form.working_hours.trim() || null,
      experience: form.experience.trim() || null,
      education: form.education.trim() || null,
      accommodation: form.accommodation,
      insurance: form.insurance,
      flight_ticket: form.flight_ticket,
      visa_support: form.visa_support,
      description: form.description.trim() || null,
      requirements: lines(form.requirements),
      benefits: lines(form.benefits),
      status: 'published',
      published_at: new Date().toISOString()
    });
    if (error) {
      setMsg(error.message);
      return;
    }
    setForm(EMPTY);
    setMsg('تم نشر الوظيفة ✓ وهتظهر للمتقدمين الآن.');
    load();
  }

  async function setStatus(id: string, status: string) {
    await supabase.from('jobs').update({ status }).eq('id', id);
    load();
  }

  async function remove(j: JobRow) {
    if (!window.confirm(`حذف وظيفة "${j.title}"؟`)) return;
    const { error } = await supabase.from('jobs').delete().eq('id', j.id);
    if (error) setMsg(error.message);
    load();
  }

  const input = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm';
  const check = (key: 'accommodation' | 'insurance' | 'flight_ticket' | 'visa_support', label: string) => (
    <label className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
      <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} />
      {label}
    </label>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar active="jobs" />
      <main className="min-w-0 flex-1 p-4 pb-24 md:p-6">
        <h1 className="mb-4 text-xl font-extrabold text-navy">الوظائف</h1>

        <div className="mb-6 space-y-3 rounded-2xl bg-white p-4 shadow-card">
          <p className="font-bold text-navy">إضافة وظيفة جديدة</p>
          {companies.length === 0 && (
            <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
              لازم تضيف شركة معتمدة الأول من صفحة "الشركات" قبل ما تضيف وظيفة.
            </p>
          )}
          <select className={input} value={form.company_id} onChange={(e) => set('company_id', e.target.value)}>
            <option value="">الشركة *</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input className={input} placeholder="اسم الوظيفة * (مثال: كهربائي مباني)" value={form.title} onChange={(e) => set('title', e.target.value)} />
          <select className={input} value={form.profession_id} onChange={(e) => set('profession_id', e.target.value)}>
            <option value="">المهنة...</option>
            {professions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select className={input} value={form.country_id} onChange={(e) => set('country_id', e.target.value)}>
            <option value="">الدولة *</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flag_url} {c.name}
              </option>
            ))}
          </select>
          <input className={input} placeholder="المدينة" value={form.city_name} onChange={(e) => set('city_name', e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <input className={input} type="number" placeholder="الراتب من" value={form.salary_min} onChange={(e) => set('salary_min', e.target.value)} />
            <input className={input} type="number" placeholder="الراتب إلى" value={form.salary_max} onChange={(e) => set('salary_max', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select className={input} value={form.currency} onChange={(e) => set('currency', e.target.value)}>
              <option value="USD">دولار $</option>
              <option value="EUR">يورو €</option>
              <option value="EGP">جنيه مصري</option>
              <option value="SAR">ريال سعودي</option>
              <option value="AED">درهم إماراتي</option>
            </select>
            <input className={input} type="number" placeholder="عدد المطلوبين" value={form.vacancies} onChange={(e) => set('vacancies', e.target.value)} />
          </div>
          <input className={input} placeholder="نوع العقد" value={form.contract_type} onChange={(e) => set('contract_type', e.target.value)} />
          <input className={input} placeholder="ساعات العمل" value={form.working_hours} onChange={(e) => set('working_hours', e.target.value)} />
          <input className={input} placeholder="الخبرة المطلوبة" value={form.experience} onChange={(e) => set('experience', e.target.value)} />
          <input className={input} placeholder="المؤهل المطلوب" value={form.education} onChange={(e) => set('education', e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            {check('accommodation', 'سكن')}
            {check('insurance', 'تأمين')}
            {check('flight_ticket', 'تذاكر سفر')}
            {check('visa_support', 'دعم تأشيرة')}
          </div>
          <textarea className={input} rows={3} placeholder="وصف الوظيفة" value={form.description} onChange={(e) => set('description', e.target.value)} />
          <textarea className={input} rows={3} placeholder="المتطلبات (كل شرط في سطر)" value={form.requirements} onChange={(e) => set('requirements', e.target.value)} />
          <textarea className={input} rows={3} placeholder="المميزات (كل ميزة في سطر)" value={form.benefits} onChange={(e) => set('benefits', e.target.value)} />
          <button onClick={add} className="w-full rounded-xl bg-navy py-3 text-sm font-bold text-white">
            نشر الوظيفة
          </button>
          {msg && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{msg}</p>}
        </div>

        <div className="space-y-3">
          {rows.length === 0 && <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 shadow-card">لا توجد وظائف بعد.</p>}
          {rows.map((j) => (
            <div key={j.id} className="rounded-2xl bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-navy">{j.title}</p>
                  <p className="text-xs text-slate-400">
                    {[j.company?.name, j.country?.name, j.city_name].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                  {STATUS_AR[j.status] ?? j.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => setStatus(j.id, 'published')} className="rounded-lg bg-emerald-50 px-2 py-1 text-xs text-emerald-700">نشر</button>
                <button onClick={() => setStatus(j.id, 'closed')} className="rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-700">إغلاق</button>
                <button onClick={() => remove(j)} className="rounded-lg bg-rose-50 px-2 py-1 text-xs text-rose-600">حذف</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
