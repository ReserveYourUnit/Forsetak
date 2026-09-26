import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function Profile() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="flex items-center gap-3 bg-navy px-4 py-4 text-white">
        <button onClick={() => navigate(-1)} aria-label="رجوع">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">ملفي الشخصي</h1>
      </div>

      <div className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-card">
        {!isSupabaseConfigured && (
          <p className="mb-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
            التطبيق غير متصل بقاعدة بيانات حقيقية بعد، فلا يمكن عرض أو تعديل بيانات فعلية الآن.
          </p>
        )}
        <p className="text-sm text-slate-500">البريد الإلكتروني</p>
        <p className="font-medium text-navy">{email ?? '—'}</p>
        <p className="mt-4 text-xs text-slate-400">
          بيانات المتقدم الكاملة (الاسم، الهاتف، المحافظة، المهنة، بيانات السفر) تُعدَّل من نموذج التقديم وتُخزَّن في جدول
          applicants على Supabase.
        </p>
        <button
          onClick={() => navigate('/apply')}
          className="mt-4 w-full rounded-2xl bg-navy py-3 text-sm font-bold text-white shadow-card"
        >
          تعديل بياناتي
        </button>
      </div>
    </div>
  );
}
