import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const ITEMS = [
  { key: 'dashboard', label: 'لوحة التحكم', to: '/admin/dashboard' },
  { key: 'applicants', label: 'المتقدمون', to: '/admin/applicants' },
  { key: 'payments', label: 'المدفوعات', to: '/admin/payments' },
  { key: 'jobs', label: 'الوظائف', to: '/admin/jobs' },
  { key: 'banners', label: 'الإعلانات', to: '/admin/banners' },
  { key: 'companies', label: 'الشركات', to: '/admin/companies' },
  { key: 'countries', label: 'الدول', to: '/admin/countries' },
  { key: 'professions', label: 'المهن والحرف', to: '/admin/professions' },
  { key: 'settings', label: 'الإعدادات', to: '/admin/settings' }
];

export function AdminSidebar({ active }: { active: string }) {
  const navigate = useNavigate();

  async function logout() {
    await supabase.auth.signOut();
    navigate('/admin');
  }

  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col bg-navy text-white md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <img src="/assets/logo.png" alt="فرصتك" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-bold">فرصتك Admin</span>
        </div>
        <nav className="flex-1 px-3">
          {ITEMS.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={`block rounded-xl px-3 py-2.5 text-sm font-medium ${
                active === item.key ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="m-3 rounded-xl border border-white/20 py-2.5 text-sm font-medium text-white">
          تسجيل الخروج
        </button>
      </aside>

      {/* Phone: scrollable bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex gap-2 overflow-x-auto bg-navy px-3 py-2 md:hidden">
        {ITEMS.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className={`shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium ${
              active === item.key ? 'bg-amber text-navy' : 'bg-white/10 text-slate-200'
            }`}
          >
            {item.label}
          </Link>
        ))}
        <button onClick={logout} className="shrink-0 whitespace-nowrap rounded-full bg-rose-500/20 px-3 py-2 text-xs font-medium text-rose-200">
          خروج
        </button>
      </nav>
    </>
  );
}
