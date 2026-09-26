import { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { Country } from '../../types';

export default function AdminCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [form, setForm] = useState<Partial<Country>>({ region: 'arab', active: true, featured: false });

  async function load() {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase.from('countries').select('*').order('name');
    setCountries((data as Country[]) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addCountry() {
    if (!isSupabaseConfigured || !form.name) return;
    await supabase.from('countries').insert(form);
    setForm({ region: 'arab', active: true, featured: false });
    load();
  }

  async function toggle(id: string, field: 'active' | 'featured', value: boolean) {
    await supabase.from('countries').update({ [field]: !value }).eq('id', id);
    load();
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar active="countries" />
      <main className="flex-1 p-6">
        <h1 className="mb-4 text-xl font-extrabold text-navy">إدارة الدول</h1>

        {!isSupabaseConfigured && (
          <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
            لوحة الإدارة غير متصلة بقاعدة بيانات حقيقية بعد.
          </p>
        )}

        <div className="mb-6 flex flex-wrap items-end gap-2 rounded-2xl bg-white p-4 shadow-card">
          <div>
            <label className="mb-1 block text-xs text-slate-500">اسم الدولة</label>
            <input
              value={form.name ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">العلم (رمز إيموجي أو رابط)</label>
            <input
              value={form.flag_url ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, flag_url: e.target.value }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">المنطقة</label>
            <select
              value={form.region}
              onChange={(e) => setForm((f) => ({ ...f, region: e.target.value as Country['region'] }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="arab">دول عربية</option>
              <option value="europe">أوروبا</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          <button onClick={addCountry} className="rounded-lg bg-navy px-4 py-2 text-sm font-bold text-white">
            إضافة دولة
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="p-3 text-right">الدولة</th>
                <th className="p-3 text-right">المنطقة</th>
                <th className="p-3 text-right">نشطة</th>
                <th className="p-3 text-right">الأكثر طلبًا</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((c) => (
                <tr key={c.id} className="border-b border-slate-50">
                  <td className="p-3">
                    {c.flag_url} {c.name}
                  </td>
                  <td className="p-3">{c.region}</td>
                  <td className="p-3">
                    <button onClick={() => toggle(c.id, 'active', c.active)} className="text-xs text-sky">
                      {c.active ? 'نشطة' : 'معطّلة'}
                    </button>
                  </td>
                  <td className="p-3">
                    <button onClick={() => toggle(c.id, 'featured', c.featured)} className="text-xs text-sky">
                      {c.featured ? 'نعم' : 'لا'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
