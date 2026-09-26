import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError('التطبيق غير متصل بقاعدة بيانات حقيقية بعد. أضف إعدادات Supabase في .env (راجع README.md).');
      return;
    }

    setLoading(true);
    const { error: authError } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }
    navigate('/');
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-6">
      <div className="mx-auto mb-8 flex flex-col items-center">
        <img src="/assets/logo.png" alt="فرصتك" className="h-16 w-16 rounded-full object-cover" />
        <h1 className="mt-3 text-xl font-extrabold text-navy">فرصتك</h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-5 shadow-card">
        <h2 className="text-center font-bold text-navy">{mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>

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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-sky focus:outline-none"
          />
        </div>

        {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-amber py-3 text-sm font-bold text-navy shadow-card disabled:opacity-60"
        >
          {loading ? 'جاري التحميل...' : mode === 'signin' ? 'دخول' : 'إنشاء الحساب'}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="w-full text-center text-sm font-medium text-sky"
        >
          {mode === 'signin' ? 'ليس لديك حساب؟ أنشئ حسابًا جديدًا' : 'لديك حساب بالفعل؟ سجّل الدخول'}
        </button>
      </form>
    </div>
  );
}
