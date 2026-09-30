import { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { supabase } from '../../lib/supabaseClient';
import { Profession } from '../../types';

export default function AdminProfessions() {
  const [items, setItems] = useState<Profession[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [requiresCv, setRequiresCv] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase.from('professions').select('*').order('name');
    if (error) {
      setMsg(error.message);
      return;
    }
    setItems((data ?? []) as Profession[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!name.trim()) {
      setMsg('اكتب اسم المهنة أولًا.');
      return;
    }
    const { error } = await supabase
      .from('professions')
      .insert({ name: name.trim(), category: category.trim() || null, active: true, requires_cv: requiresCv });
    if (error) {
      setMsg(error.message);
      return;
    }
    setName('');
    setCategory('');
    setRequiresCv(true);
    setMsg('تمت إضافة المهنة ✓');
    load();
  }

  async function toggleActive(p: Profession) {
    await supabase.from('professions').update({ active: !p.active }).eq('id', p.id);
    load();
  }

  async function toggleCv(p: Profession) {
    await supabase.from('professions').update({ requires_cv: !p.requires_cv }).eq('id', p.id);
    load();
  }

  async function remove(p: Profession) {
    if (!window.confirm(`حذف "${p.name}"؟`)) return;
    const { error } = await supabase.from('professions').delete().eq('id', p.id);
    if (error) setMsg('تعذر الحذف (قد تكون مرتبطة بوظائف). يمكنك تعطيلها بدلًا من ذلك.');
    load();
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar active="professions" />
      <main className="min-w-0 flex-1 p-4 pb-24 md:p-6">
        <h1 className="mb-4 text-xl font-extrabold text-navy">المهن والحرف</h1>

        <div className="mb-6 space-y-3 rounded-2xl bg-white p-4 shadow-card">
          <p className="font-bold text-navy">إضافة مهنة / حرفة جديدة</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسم المهنة (مثال: سباك، أو طبيب)"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="التصنيف (اختياري، مثال: فني أو إداري)"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          />
          <label className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
            <input type="checkbox" checked={requiresCv} onChange={(e) => setRequiresCv(e.target.checked)} />
            تتطلب رفع سيرة ذاتية (CV) عند التقديم — فعّلها للمهن العلمية/الإدارية (طب، هندسة، محاسبة، برمجة...)
            وعطّلها للمهن الحرفية (سباك، نجار، كهربائي...)
          </label>
          <button onClick={add} className="w-full rounded-xl bg-navy py-3 text-sm font-bold text-white">
            إضافة
          </button>
          {msg && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{msg}</p>}
        </div>

        <div className="rounded-2xl bg-white shadow-card">
          {items.length === 0 && <p className="p-6 text-center text-sm text-slate-400">لا توجد مهن.</p>}
          {items.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 p-3">
              <div className="min-w-0">
                <p className={`font-medium ${p.active ? 'text-navy' : 'text-slate-400 line-through'}`}>{p.name}</p>
                <p className="text-xs text-slate-400">
                  {p.category ?? '—'} · {p.requires_cv ? 'يتطلب CV' : 'بدون CV'}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  onClick={() => toggleCv(p)}
                  className={`rounded-lg px-2 py-1 text-xs ${p.requires_cv ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}
                >
                  {p.requires_cv ? 'إلغاء طلب CV' : 'اطلب CV'}
                </button>
                <button onClick={() => toggleActive(p)} className="rounded-lg bg-sky-50 px-2 py-1 text-xs text-sky-600">
                  {p.active ? 'تعطيل' : 'تفعيل'}
                </button>
                <button onClick={() => remove(p)} className="rounded-lg bg-rose-50 px-2 py-1 text-xs text-rose-600">
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
