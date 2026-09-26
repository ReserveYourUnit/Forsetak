import { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { APPLICATION_STATUS_LABELS_AR, ApplicationStatus } from '../../types';

interface Row {
  id: string;
  application_number: string;
  status: ApplicationStatus;
  full_name: string;
  phone: string;
  whatsapp: string;
  governorate_id: string;
  desired_country_id: string;
}

export default function AdminApplicants() {
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    let query = supabase
      .from('applications')
      .select('id, application_number, status, applicant:applicants(full_name, phone, whatsapp, governorate_id, desired_country_id)')
      .order('created_at', { ascending: false })
      .limit(100);
    const { data } = await query;
    setRows(
      (data ?? []).map((r: any) => ({
        id: r.id,
        application_number: r.application_number,
        status: r.status,
        full_name: r.applicant?.full_name ?? '',
        phone: r.applicant?.phone ?? '',
        whatsapp: r.applicant?.whatsapp ?? '',
        governorate_id: r.applicant?.governorate_id ?? '',
        desired_country_id: r.applicant?.desired_country_id ?? ''
      }))
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(id: string, status: ApplicationStatus) {
    await supabase.from('applications').update({ status }).eq('id', id);
    load();
  }

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.trim();
    return [r.full_name, r.application_number, r.phone, r.whatsapp].some((v) => v.includes(q));
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar active="applicants" />
      <main className="flex-1 p-6">
        <h1 className="mb-4 text-xl font-extrabold text-navy">المتقدمون</h1>

        {!isSupabaseConfigured && (
          <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
            لوحة الإدارة غير متصلة بقاعدة بيانات حقيقية بعد.
          </p>
        )}

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم، رقم الطلب، الهاتف أو WhatsApp"
          className="mb-4 w-full max-w-md rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-sky focus:outline-none"
        />

        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="p-3 text-right">رقم الطلب</th>
                <th className="p-3 text-right">الاسم</th>
                <th className="p-3 text-right">الهاتف / WhatsApp</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    جاري التحميل...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    لا توجد نتائج.
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-slate-50">
                  <td className="p-3 font-medium text-navy">{r.application_number}</td>
                  <td className="p-3">{r.full_name}</td>
                  <td className="p-3">
                    {r.phone}
                    <br />
                    <a
                      href={`https://wa.me/${r.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-600"
                    >
                      فتح WhatsApp
                    </a>
                  </td>
                  <td className="p-3">
                    <select
                      value={r.status}
                      onChange={(e) => changeStatus(r.id, e.target.value as ApplicationStatus)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                    >
                      {Object.entries(APPLICATION_STATUS_LABELS_AR).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-xs text-sky">فتح الملف</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
                  }
