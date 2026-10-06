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
  currency: '',
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

// عملة كل دولة، تتحدد تلقائيًا عند اختيار الدولة ولا تُكتب يدويًا.
const CURRENCY_BY_COUNTRY: Record<string, string> = {
  'السعودية': 'ريال سعودي',
  'المملكة العربية السعودية': 'ريال سعودي',
  'الإمارات': 'درهم إماراتي',
  'الإمارات العربية المتحدة': 'درهم إماراتي',
  'قطر': 'ريال قطري',
  'الكويت': 'دينار كويتي',
  'البحرين': 'دينار بحريني',
  'عمان': 'ريال عماني',
  'سلطنة عمان': 'ريال عماني',
  'الأردن': 'دينار أردني',
  'مصر': 'جنيه مصري',
  'العراق': 'دينار عراقي',
  'لبنان': 'ليرة لبنانية',
  'سوريا': 'ليرة سورية',
  'اليمن': 'ريال يمني',
  'ليبيا': 'دينار ليبي',
  'تونس': 'دينار تونسي',
  'الجزائر': 'دينار جزائري',
  'المغرب': 'درهم مغربي',
  'السودان': 'جنيه سوداني',
  'فلسطين': 'دينار أردني',
  'موريتانيا': 'أوقية موريتانية',
  'الصومال': 'شلن صومالي',
  'جيبوتي': 'فرنك جيبوتي',
  'جزر القمر': 'فرنك قمري',
  'ألمانيا': 'يورو',
  'فرنسا': 'يورو',
  'إيطاليا': 'يورو',
  'إسبانيا': 'يورو',
  'هولندا': 'يورو',
  'اليونان': 'يورو',
  'البرتغال': 'يورو',
  'النمسا': 'يورو',
  'بلجيكا': 'يورو',
  'بولندا': 'زلوتي بولندي',
  'المملكة المتحدة': 'جنيه إسترليني',
  'بريطانيا': 'جنيه إسترليني',
  'تركيا': 'ليرة تركية',
  'الولايات المتحدة': 'دولار أمريكي',
  'أمريكا': 'دولار أمريكي',
  'كندا': 'دولار كندي',
  'ماليزيا': 'رينغيت ماليزي'
};

function currencyForCountry(name?: string | null): string {
  if (!name) return '';
  if (CURRENCY_BY_COUNTRY[name]) return CURRENCY_BY_COUNTRY[name];
  const match = Object.keys(CURRENCY_BY_COUNTRY).find((k) => name.includes(k) || k.includes(name));
  return match ? CURRENCY_BY_COUNTRY[match] : '';
}

// مدن كل دولة، تُقترح تلقائيًا بعد اختيار الدولة.
const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'السعودية': ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الظهران', 'الطائف', 'تبوك', 'بريدة', 'خميس مشيط', 'نجران', 'حائل', 'جازان', 'ينبع', 'الأحساء', 'أبها'],
  'الإمارات': ['دبي', 'أبوظبي', 'الشارقة', 'عجمان', 'رأس الخيمة', 'الفجيرة', 'أم القيوين', 'العين'],
  'قطر': ['الدوحة', 'الريان', 'الوكرة', 'الخور', 'أم صلال', 'مسيعيد', 'دخان'],
  'الكويت': ['مدينة الكويت', 'حولي', 'الفروانية', 'الأحمدي', 'الجهراء', 'مبارك الكبير'],
  'البحرين': ['المنامة', 'المحرق', 'الرفاع', 'مدينة حمد', 'مدينة عيسى', 'سترة'],
  'عمان': ['مسقط', 'صلالة', 'صحار', 'نزوى', 'صور', 'البريمي', 'الرستاق'],
  'سلطنة عمان': ['مسقط', 'صلالة', 'صحار', 'نزوى', 'صور', 'البريمي', 'الرستاق'],
  'الأردن': ['عمّان', 'الزرقاء', 'إربد', 'العقبة', 'السلط', 'مادبا', 'الكرك'],
  'مصر': ['القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة', 'طنطا', 'الزقازيق', 'أسيوط', 'الأقصر', 'أسوان', 'بورسعيد', 'السويس', 'دمياط', 'شرم الشيخ', 'الغردقة'],
  'العراق': ['بغداد', 'البصرة', 'الموصل', 'أربيل', 'النجف', 'كربلاء', 'السليمانية', 'كركوك'],
  'لبنان': ['بيروت', 'طرابلس', 'صيدا', 'صور', 'جونيه', 'زحلة'],
  'سوريا': ['دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس'],
  'اليمن': ['صنعاء', 'عدن', 'تعز', 'الحديدة', 'المكلا'],
  'ليبيا': ['طرابلس', 'بنغازي', 'مصراتة', 'سبها'],
  'تونس': ['تونس العاصمة', 'صفاقس', 'سوسة', 'بنزرت', 'القيروان'],
  'الجزائر': ['الجزائر العاصمة', 'وهران', 'قسنطينة', 'عنابة', 'سطيف'],
  'المغرب': ['الرباط', 'الدار البيضاء', 'مراكش', 'فاس', 'طنجة', 'أكادير'],
  'السودان': ['الخرطوم', 'أم درمان', 'بورتسودان', 'كسلا'],
  'فلسطين': ['رام الله', 'غزة', 'الخليل', 'نابلس', 'بيت لحم', 'القدس'],
  'ألمانيا': ['برلين', 'ميونخ', 'هامبورغ', 'فرانكفورت', 'كولونيا', 'شتوتغارت'],
  'فرنسا': ['باريس', 'مرسيليا', 'ليون', 'تولوز', 'نيس'],
  'إيطاليا': ['روما', 'ميلانو', 'نابولي', 'تورينو'],
  'إسبانيا': ['مدريد', 'برشلونة', 'فالنسيا', 'إشبيلية'],
  'هولندا': ['أمستردام', 'روتردام', 'لاهاي'],
  'تركيا': ['إسطنبول', 'أنقرة', 'إزمير', 'بورصة', 'أنطاليا'],
  'المملكة المتحدة': ['لندن', 'مانشستر', 'برمنغهام', 'ليدز'],
  'بريطانيا': ['لندن', 'مانشستر', 'برمنغهام', 'ليدز'],
  'كندا': ['تورونتو', 'مونتريال', 'فانكوفر']
};

function citiesForCountry(name?: string | null): string[] {
  if (!name) return [];
  if (CITIES_BY_COUNTRY[name]) return CITIES_BY_COUNTRY[name];
  const match = Object.keys(CITIES_BY_COUNTRY).find((k) => name.includes(k) || k.includes(name));
  return match ? CITIES_BY_COUNTRY[match] : [];
}

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cityCustom, setCityCustom] = useState(false);
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

  function setCountryId(id: string) {
    const c = countries.find((x) => x.id === id);
    setForm((f) => ({ ...f, country_id: id, currency: id ? currencyForCountry(c?.name) : '', city_name: '' }));
    setCityCustom(false);
  }

  async function startEdit(id: string) {
    setMsg(null);
    const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
    if (error || !data) {
      setMsg(error?.message ?? 'تعذر تحميل بيانات الإعلان.');
      return;
    }
    setEditingId(id);
    setForm({
      company_id: data.company_id ?? '',
      title: data.title ?? '',
      profession_id: data.profession_id ?? '',
      country_id: data.country_id ?? '',
      city_name: data.city_name ?? '',
      vacancies: String(data.vacancies ?? 1),
      salary_min: data.salary_min != null ? String(data.salary_min) : '',
      salary_max: data.salary_max != null ? String(data.salary_max) : '',
      currency: data.currency ?? '',
      contract_type: data.contract_type ?? '',
      working_hours: data.working_hours ?? '',
      experience: data.experience ?? '',
      education: data.education ?? '',
      accommodation: !!data.accommodation,
      insurance: !!data.insurance,
      flight_ticket: !!data.flight_ticket,
      visa_support: !!data.visa_support,
      description: data.description ?? '',
      requirements: Array.isArray(data.requirements) ? data.requirements.join('\n') : '',
      benefits: Array.isArray(data.benefits) ? data.benefits.join('\n') : ''
    });
    const editCountryName = countries.find((c) => c.id === (data.country_id ?? ''))?.name;
    const editCityList = citiesForCountry(editCountryName);
    setCityCustom(editCityList.length === 0 ? true : !!data.city_name && !editCityList.includes(data.city_name));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
    setMsg(null);
  }

  async function save() {
    if (!form.company_id || !form.title.trim() || !form.country_id) {
      setMsg('اختر الشركة واكتب اسم الوظيفة واختر الدولة.');
      return;
    }

    const payload = {
      company_id: form.company_id,
      title: form.title.trim(),
      profession_id: form.profession_id || null,
      country_id: form.country_id,
      city_name: form.city_name.trim() || null,
      vacancies: Number(form.vacancies) || 1,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      currency: form.currency || null,
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
      benefits: lines(form.benefits)
    };

    if (editingId) {
      // تحديث نفس سجل الإعلان بالـ ID، من غير ما نلمس حالة النشر الحالية.
      const { error } = await supabase.from('jobs').update(payload).eq('id', editingId);
      if (error) {
        setMsg(error.message);
        return;
      }
      setMsg('تم حفظ تعديلات الإعلان بنجاح ✓');
      setEditingId(null);
      setForm(EMPTY);
      load();
      return;
    }

    const { error } = await supabase.from('jobs').insert({
      ...payload,
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

  const selectedCountryName = countries.find((c) => c.id === form.country_id)?.name;
  const cityList = citiesForCountry(selectedCountryName);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar active="jobs" />
      <main className="min-w-0 flex-1 p-4 pb-24 md:p-6">
        <h1 className="mb-4 text-xl font-extrabold text-navy">الوظائف</h1>

        <div className="mb-6 space-y-3 rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-navy">{editingId ? 'تعديل بيانات الإعلان' : 'إضافة وظيفة جديدة'}</p>
            {editingId && (
              <button onClick={cancelEdit} className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
                إلغاء التعديل
              </button>
            )}
          </div>

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

          <select className={input} value={form.country_id} onChange={(e) => setCountryId(e.target.value)}>
            <option value="">الدولة *</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flag_url} {c.name}
              </option>
            ))}
          </select>

          <div>
            <label className="mb-1 block text-xs text-slate-500">العملة (تتحدد تلقائيًا حسب الدولة)</label>
            <div className={`${input} bg-slate-50 text-slate-500`}>{form.currency || 'اختر الدولة أولاً'}</div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">المدينة</label>
            {cityList.length > 0 && !cityCustom ? (
              <select
                className={input}
                value={form.city_name}
                onChange={(e) => {
                  if (e.target.value === '__other__') {
                    setCityCustom(true);
                    set('city_name', '');
                  } else {
                    set('city_name', e.target.value);
                  }
                }}
              >
                <option value="">اختر المدينة</option>
                {cityList.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
                <option value="__other__">مدينة أخرى (اكتبها يدويًا)</option>
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  className={`${input} flex-1`}
                  placeholder="اكتب اسم المدينة"
                  value={form.city_name}
                  onChange={(e) => set('city_name', e.target.value)}
                />
                {cityList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCityCustom(false);
                      set('city_name', '');
                    }}
                    className="shrink-0 rounded-lg bg-slate-100 px-2 py-2.5 text-xs text-slate-600"
                  >
                    اختيار من القائمة
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">الراتب من</label>
            <div className="flex items-center gap-2">
              <input
                className={`${input} flex-1`}
                type="number"
                placeholder="مثال: 3000"
                value={form.salary_min}
                onChange={(e) => set('salary_min', e.target.value)}
              />
              <span className="shrink-0 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500">{form.currency || '—'}</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">الراتب إلى</label>
            <div className="flex items-center gap-2">
              <input
                className={`${input} flex-1`}
                type="number"
                placeholder="مثال: 5000"
                value={form.salary_max}
                onChange={(e) => set('salary_max', e.target.value)}
              />
              <span className="shrink-0 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500">{form.currency || '—'}</span>
            </div>
          </div>

          <input className={input} type="number" placeholder="عدد المطلوبين" value={form.vacancies} onChange={(e) => set('vacancies', e.target.value)} />

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

          <button onClick={save} className="w-full rounded-xl bg-navy py-3 text-sm font-bold text-white">
            {editingId ? 'حفظ التعديلات' : 'نشر الوظيفة'}
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
                  {(j.salary_min || j.salary_max) && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {j.salary_min?.toLocaleString() ?? '—'} {j.currency} - {j.salary_max?.toLocaleString() ?? '—'} {j.currency}
                    </p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                  {STATUS_AR[j.status] ?? j.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => startEdit(j.id)} className="rounded-lg bg-sky-50 px-2 py-1 text-xs text-sky-700">تعديل</button>
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
