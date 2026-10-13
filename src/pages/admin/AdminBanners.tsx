import { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { supabase } from '../../lib/supabaseClient';
import { Banner } from '../../types/banner';

const EMPTY = {
  text_content: '',
  sort_order: '0',
  active: true
};

export default function AdminBanners() {
  const [rows, setRows] = useState<Banner[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from('banners')
      .select('id, text_content, sort_order, active')
      .order('sort_order', { ascending: true });
    if (error) {
      setMsg(error.message);
      return;
    }
    setRows((data ?? []) as Banner[]);
  }

  useEffect(() => {
    load();
  }, []);

  function set(key: keyof typeof EMPTY, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(b: Banner) {
    setEditingId(b.id);
    setForm({
      text_content: b.text_content,
      sort_order: String(b.sort_order ?? 0),
      active: b.active
    });
    setMsg(null);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
    setMsg(null);
  }

  async function save() {
    if (!form.text_content.trim()) {
      setMsg('اكتب نص الإعلان أولًا.');
      return;
    }

    const payload = {
      text_content: form.text_content.trim(),
      sort_order: Number(form.sort_order) || 0,
      active: form.active
    };

    if (editingId) {
      const { error } = await supabase.from('banners').update(payload).eq('id', editingId);
      if (error) {
        setMsg(error.message);
        return;
      }
      setMsg('تم حفظ تعديلات الإعلان بنجاح ✓');
    } else {
      const { error } = await supabase.from('banners').insert(payload);
      if (error) {
        setMsg(error.message);
        return;
      }
      setMsg('تمت إضافة الإعلان ✓ وهيظهر للمتقدمين في الصفحة الرئيسية.');
    }
    setEditingId(null);
    setForm(EMPTY);
    load();
  }

  async function toggleActive(b: Banner) {
    await supabase.from('banners').update({ active: !b.active }).eq('id', b.id);
    load();
  }

  async function remove(b: Banner) {
    if (!window.confirm('حذف هذا الإعلان؟')) return;
    const { error } = await supabase.from('banners').delete().eq('id', b.id);
    if (error) setMsg(error.message);
    load();
  }

  const input = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm';

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar active="banners" />
      <main className="min-w-0 flex-1 p-4 pb-24 md:p-6">
        <h1 className="mb-4 text-xl font-extrabold text-navy">إعلانات الصفحة الرئيسية</h1>
        <p className="mb-4 text-xs text-slate-500">
          اكتب نص الإعلان هنا، وهيظهر في مربع بعرض الشاشة أعلى الصفحة الرئيسية للمتقدمين، فوق قسم الشركات والوظائف مباشرة.
        </p>

        <div className="mb-6 space-y-3 rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-navy">{editingId ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}</p>
            {editingId && (
              <button onClick={cancelEdit} className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
                إلغاء التعديل
              </button>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">نص الإعلان</label>
            <textarea
              className={input}
              rows={3}
              placeholder="اكتب نص الإعلان هنا..."
              value={form.text_content}
              onChange={(e) => set('text_content', e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">ترتيب الظهور (الأصغر يظهر أولًا)</label>
            <input className={input} type="number" value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)} />
          </div>

          <label className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
            مفعّل (يظهر للمتقدمين)
          </label>

          <button onClick={save} className="w-full rounded-xl bg-navy py-3 text-sm font-bold text-white">
            {editingId ? 'حفظ التعديلات' : 'إضافة الإعلان'}
          </button>

          {msg && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{msg}</p>}
        </div>

        <div className="space-y-3">
          {rows.length === 0 && <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 shadow-card">لا توجد إعلانات بعد.</p>}
          {rows.map((b) => (
            <div key={b.id} className="rounded-2xl bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-slate-700">{b.text_content}</p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${b.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {b.active ? 'مفعّل' : 'متوقف'}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">ترتيب {b.sort_order}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={() => startEdit(b)} className="rounded-lg bg-sky-50 px-2 py-1 text-xs text-sky-700">تعديل</button>
                <button onClick={() => toggleActive(b)} className="rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-700">
                  {b.active ? 'إيقاف' : 'تفعيل'}
                </button>
                <button onClick={() => remove(b)} className="rounded-lg bg-rose-50 px-2 py-1 text-xs text-rose-600">حذف</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
    }
