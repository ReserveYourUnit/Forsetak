import { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { supabase } from '../../lib/supabaseClient';
import { Country } from '../../types';

interface CompanyRow {
  id: string;
  name: string;
  field: string | null;
  phone: string | null;
  whatsapp: string | null;
  verification_status: string;
  country: { name: string; flag_url: string } | null;
}

const EMPTY = {
  name: '',
  country_id: '',
  field: '',
  responsible_person: '',
  phone: '',
  whatsapp: '',
  email: '',
  website: '',
  description: ''
};

const STATUS_AR: Record<string, string> = {
  pending: 'قيد المراجعة',
  approved: 'معتمدة',
  rejected: 'مرفوضة'
};

export default function AdminCompanies() {
  const [rows, setRows] = useState<CompanyRow[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, field, phone, whatsapp, verification_status, country:countries(name, flag_url)')
      .order('created_at', { ascending: false });
    if (error) {
      setMsg(error.message);
      return;
    }
    setRows((data ?? []) as unknown as CompanyRow[]);
  }

  useEffect(() => {
    load();
    supabase
      .from('countries')
      .select('*')
      .order('name')
      .then(({ data }) => setCountries((data ?? []) as Country[]));
  }, []);

  function set(key: keyof typeof EMPTY, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const clean = (v: string) => (v.trim() === '' ? null : v.trim());

  async function add() {
    if (!form.name.trim()) {
      setMsg('اكتب اسم الشركة أولًا.');
      return;
    }
    const { error } = await supabase.from('companies').insert({
      name: form.name.trim(),
      country_id: form.country_id || null,
      field: clean(form.field),
      responsible_person: clean(form.responsible_person),
      phone: clean(form.phone),
      whatsapp: clean(form.whatsapp),
      email: clean(form.email),
      website: clean(form.website),
      description: clean(form.description),
      verification_status: 'approved'
    });
    if (error) {
      setMsg(error.message);
      return;
    }
    setForm(EMPTY);
    setMsg('تمت إضافة الشركة واعتمادها ✓');
    load();
  }

  async function setStatus(id: string, status: string) {
    await supabase.from('companies').update({ verification_status: status }).eq('id', id);
    load();
  }

  async function remove(c: CompanyRow) {
    if (!window.confirm(`حذف "${c.name}" وكل وظائفها؟`)) return;
    const { error } = await supabase.from('companies').delete().eq('id', c.id);
    if (error) setMsg(error.message);
    load();
  }

  const input = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm';

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar active="companies" />
      <main className="min-w-0 flex-1 p-4 pb-24 md:p-6">
        <h1 className="mb-4 text-xl font-extrabold text-navy">الشركات</h1>

        <div className="mb-6 space-y-3 rounded-2xl bg-white p-4 shadow-card">
          <p className="font-bold text-navy">إضافة شركة جديدة</p>
          <input className={input} placeholder="اسم الشركة *" value={form.name} onChange={(e) => set('name', e.target.value)} />
          <select className={input} value={form.country_id} onChange={(e) => set('country_id', e.target.value)}>
            <option value="">الدولة...</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flag_url} {c.name}
              </option>
            ))}
          </select>
          <input className={input} placeholder="المجال (مثال: مقاولات، فنادق، مصانع)" value={form.field} onChange={(e) => set('field', e.target.value)} />
          <input className={input} placeholder="اسم المسؤول" value={form.responsible_person} onChange={(e) => set('responsible_person', e.target.value)} />
          <input className={input} placeholder="الهاتف" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          <input className={input} placeholder="WhatsApp" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
          <input className={input} placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => set('email', e.target.value)} />
          <input className={input} placeholder="الموقع الإلكتروني" value={form.website} onChange={(e) => set('website', e.target.value)} />
          <textarea className={input} rows={3} placeholder="وصف الشركة ومواصفاتها" value={form.description} onChange={(e) => set('description', e.target.value)} />
          <button onClick={add} className="w-full rounded-xl bg-navy py-3 text-sm font-bold text-white">
            إضافة الشركة
          </button>
          {msg && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{msg}</p>}
        </div>

        <div className="space-y-3">
          {rows.length === 0 && <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 shadow-card">لا توجد شركات بعد.</p>}
          {rows.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-navy">{c.name}</p>
                  <p className="text-xs text-slate-400">{[c.country?.name, c.field].filter(Boolean).join(' · ')}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                  {STATUS_AR[c.verification_status] ?? c.verification_status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => setStatus(c.id, 'approved')} className="rounded-lg bg-emerald-50 px-2 py-1 text-xs text-emerald-700">اعتماد</button>
                <button onClick={() => setStatus(c.id, 'rejected')} className="rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-700">رفض / إخفاء</button>
                <button onClick={() => remove(c)} className="rounded-lg bg-rose-50 px-2 py-1 text-xs text-rose-600">حذف</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
