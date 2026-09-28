import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '../components/BottomNavigation';
import { CompanyItem, fetchCompanies } from '../services/catalogService';

export default function Companies() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies().then((d) => {
      setItems(d);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="flex items-center gap-3 bg-navy px-4 py-4 text-white">
        <button onClick={() => navigate(-1)} aria-label="رجوع">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">الشركات</h1>
      </div>

      <div className="mx-4 mt-4 flex flex-col gap-3">
        {loading && <p className="py-10 text-center text-sm text-slate-400">جاري التحميل...</p>}
        {!loading && items.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">لا توجد شركات معتمدة حاليًا.</p>
        )}
        {items.map((c) => (
          <div key={c.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-2xl">
                {c.country?.flag_url ?? '🏢'}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-navy">{c.name}</p>
                <p className="text-xs text-slate-400">
                  {[c.country?.name, c.field].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
            {c.description && <p className="mt-3 text-sm leading-relaxed text-slate-600">{c.description}</p>}
          </div>
        ))}
      </div>

      <BottomNavigation />
    </div>
  );
}
