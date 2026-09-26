import { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

interface PaymentRow {
  id: string;
  amount: number;
  currency: string;
  status: string;
  transaction_reference: string | null;
  receipt_url: string | null;
  created_at: string;
}

export default function AdminPayments() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    let query = supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    setRows((data as PaymentRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function setStatus(id: string, status: 'approved' | 'rejected') {
    await supabase.from('payments').update({ status, reviewed_at: new Date().toISOString() }).eq('id', id);
    load();
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar active="payments" />
      <main className="flex-1 p-6">
        <h1 className="mb-4 text-xl font-extrabold text-navy">المدفوعات</h1>

        {!isSupabaseConfigured && (
          <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
            لوحة الإدارة غير متصلة بقاعدة بيانات حقيقية بعد.
          </p>
        )}

        <div className="mb-4 flex gap-2">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                filter === f ? 'bg-navy text-white' : 'bg-white text-slate-500 shadow-card'
              }`}
            >
              {{ pending: 'قيد المراجعة', approved: 'مقبول', rejected: 'مرفوض', all: 'الكل' }[f]}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="p-3 text-right">المبلغ</th>
                <th className="p-3 text-right">رقم العملية</th>
                <th className="p-3 text-right">الإيصال</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">جاري التحميل...</td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">لا توجد مدفوعات.</td>
                </tr>
              )}
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-slate-50">
                  <td className="p-3 font-medium text-navy">
                    {p.amount} {p.currency}
                  </td>
                  <td className="p-3">{p.transaction_reference ?? '—'}</td>
                  <td className="p-3 text-xs text-sky">{p.receipt_url ? 'عرض الإيصال' : '—'}</td>
                  <td className="p-3">{p.status}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => setStatus(p.id, 'approved')} className="rounded-lg bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                      قبول
                    </button>
                    <button onClick={() => setStatus(p.id, 'rejected')} className="rounded-lg bg-rose-50 px-2 py-1 text-xs text-rose-600">
                      رفض
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
