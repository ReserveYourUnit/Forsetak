import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BottomNavigation } from '../components/BottomNavigation';
import { fetchProfessions } from '../services/catalogService';
import { Profession } from '../types';

export default function ProfessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profession, setProfession] = useState<Profession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfessions().then((list) => {
      setProfession(list.find((p) => p.id === id) ?? null);
      setLoading(false);
    });
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="flex items-center gap-3 bg-navy px-4 py-4 text-white">
        <button onClick={() => navigate(-1)} aria-label="رجوع">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">{profession ? profession.name : 'المهنة'}</h1>
      </div>

      <div className="mx-4 mt-4 space-y-4">
        {loading && <p className="py-10 text-center text-sm text-slate-400">جاري التحميل...</p>}

        {!loading && !profession && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-card">
            <p className="text-sm text-slate-500">لم يتم العثور على هذه المهنة.</p>
            <button
              onClick={() => navigate('/professions')}
              className="mt-4 w-full rounded-2xl bg-navy py-3.5 text-sm font-bold text-white shadow-card"
            >
              الرجوع للمهن والحرف
            </button>
          </div>
        )}

        {profession && (
          <>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
              <h2 className="text-xl font-extrabold text-navy">{profession.name}</h2>
              {profession.category && (
                <span className="mt-2 inline-block rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-600">
                  {profession.category}
                </span>
              )}

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
                  <span className="text-slate-500">التصنيف</span>
                  <span className="font-medium text-navy">{profession.category || '—'}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
                  <span className="text-slate-500">السيرة الذاتية (CV)</span>
                  <span className="font-medium text-navy">{profession.requires_cv ? 'مطلوبة' : 'غير مطلوبة'}</span>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-400">
                قدّم طلبك الآن، وسيتواصل معك فريق فرصتك عبر WhatsApp لاستكمال الإجراءات.
              </p>
            </div>

            <button
              onClick={() => navigate(`/apply?profession=${profession.id}`)}
              className="w-full rounded-2xl bg-amber py-3.5 text-sm font-bold text-navy shadow-card"
            >
              قدم على مهنتك
            </button>

            <button
              onClick={() => navigate(`/jobs?q=${encodeURIComponent(profession.name)}`)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-navy shadow-card"
            >
              عرض الوظائف المتاحة لهذه المهنة
            </button>
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
                                                           }
