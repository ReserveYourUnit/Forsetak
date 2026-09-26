import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '../components/BottomNavigation';
import { StatusBadge } from '../components/Chips';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { APPLICATION_STATUS_LABELS_AR, ApplicationStatus } from '../types';

interface AppRow {
  id: string;
  application_number: string;
  status: ApplicationStatus;
  created_at: string;
  job_title?: string;
}

export default function MyApplications() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notConnected, setNotConnected] = useState(false);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) {
        setNotConnected(true);
        setLoading(false);
        return;
      }
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('applications')
        .select('id, application_number, status, created_at, job:jobs(title)')
        .order('created_at', { ascending: false });
      setRows(
        (data ?? []).map((r: any) => ({
          id: r.id,
          application_number: r.application_number,
          status: r.status,
          created_at: r.created_at,
          job_title: r.job?.title
        }))
      );
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-navy px-4 py-4 text-white">
        <h1 className="text-lg font-bold">طلباتي</h1>
      </div>

      <div className="mx-4 mt-4 flex flex-col gap-3">
        {loading && <p className="py-10 text-center text-sm text-slate-400">جاري التحميل...</p>}

        {notConnected && (
          <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">
            التطبيق غير متصل بقاعدة بيانات حقيقية بعد، لذلك لا يمكن عرض طلبات فعلية الآن.
          </p>
        )}

        {!loading && !notConnected && rows.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-card">
            <p className="text-sm text-slate-500">لا توجد طلبات مقدّمة بعد.</p>
            <button onClick={() => navigate('/jobs')} className="mt-3 rounded-xl bg-navy px-4 py-2 text-sm font-bold text-white">
              تصفح الوظائف
            </button>
          </div>
        )}

        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <p className="font-bold text-navy">{r.job_title ?? 'طلب عام'}</p>
              <StatusBadge status={r.status} label={APPLICATION_STATUS_LABELS_AR[r.status]} />
            </div>
            <p className="mt-1 text-xs text-slate-400">رقم الطلب: {r.application_number}</p>
          </div>
        ))}
      </div>

      <BottomNavigation />
    </div>
  );
}
