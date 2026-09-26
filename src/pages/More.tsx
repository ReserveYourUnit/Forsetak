import { Link, useNavigate } from 'react-router-dom';
import { BottomNavigation } from '../components/BottomNavigation';
import { supabase } from '../lib/supabaseClient';

const MENU = [
  { to: '/profile', label: 'ملفي الشخصي', icon: '👤' },
  { to: '/my-applications', label: 'طلباتي المقدمة', icon: '📄' },
  { to: '/jobs?saved=1', label: 'الوظائف المحفوظة', icon: '❤️' },
  { to: '/notifications', label: 'الإشعارات', icon: '🔔' },
  { to: '/help', label: 'مركز المساعدة', icon: '❓' },
  { to: '/settings', label: 'الإعدادات', icon: '⚙️' },
  { to: '/legal/terms', label: 'الشروط والأحكام', icon: '📜' },
  { to: '/legal/privacy', label: 'سياسة الخصوصية', icon: '🔒' },
  { to: '/legal/payment', label: 'سياسة الدفع والاسترداد', icon: '💳' }
];

export default function More() {
  const navigate = useNavigate();

  async function logout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-navy px-4 py-6 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-2xl">👤</div>
          <div>
            <p className="font-bold">حسابي</p>
            <p className="text-sm text-slate-300">مستعد لفرصتك القادمة</p>
          </div>
        </div>
      </div>

      <div className="mx-4 -mt-3 rounded-2xl bg-white shadow-card">
        {MENU.map((item, i) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center justify-between px-4 py-3.5 text-sm font-medium text-navy ${
              i !== MENU.length - 1 ? 'border-b border-slate-100' : ''
            }`}
          >
            <span className="flex items-center gap-3">
              <span>{item.icon}</span>
              {item.label}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ))}
      </div>

      <button
        onClick={logout}
        className="mx-4 mt-4 w-[calc(100%-2rem)] rounded-2xl border border-rose-200 bg-white py-3 text-sm font-bold text-rose-600"
      >
        تسجيل الخروج
      </button>

      <BottomNavigation />
    </div>
  );
}
