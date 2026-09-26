import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError('لوحة الإدارة غير متصلة بقاعدة بيانات حقيقية بعد. أضف إعدادات Supabase في .env أولًا.');
      return;
    }

    setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !data.user) {
      setLoading(false);
      setError(authError?.message ?? 'بيانات الدخول غير صحيحة.');
      return;
    }

    const { data: adminRow, error: adminError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', data.user.id)
      .maybeSingle();

    setLoading(false);

    if (adminError || !adminRow) {
      await supabase.auth.signOut();
      setError('هذا الحساب لا يملك صلاحية الوصول إلى لوحة الإدارة.');
      return;
    }

    navigate('/admin/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-navy-900 px-6">
      <div className="mx-auto mb-8 flex flex-col items-center text-white">
        <img src="/assets/logo.png" alt="فرصتك" className="h-14 w-14 rounded-full object-cover" />
        <h1 className="mt-3 text-lg font-extrabold">لوحة إدارة فرصتك</h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-5 shadow-cardHover">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">البريد الإلكتروني</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-sky focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">كلمة المرور</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-sky focus:outline-none"
          />
        </div>
        {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-navy py-3 text-sm font-bold text-white shadow-card disabled:opacity-60"
        >
          {loading ? 'جاري التحقق...' : 'دخول لوحة الإدارة'}
        </button>
      </form>
    </div>
  );
}
