import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { AdminSidebar } from './AdminSidebar';

interface Stats {
  applicants: number;
  newApplications: number;
  pendingReview: number;
  pendingPayments: number;
  confirmedPayments: number;
  jobs: number;
  pendingCompanies: number;
  countries: number;
}

const EMPTY_STATS: Stats = {
  applicants: 0,
  newApplications: 0,
  pendingReview: 0,
  pendingPayments: 0,
  confirmedPayments: 0,
  jobs: 0,
  pendingCompanies: 0,
  countries: 0
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      const [applicants, newApplications, pendingReview, pendingPayments, confirmedPayments, jobs, pendingCompanies, countries] =
        await Promise.all([
          supabase.from('applicants').select('id', { count: 'exact', head: true }),
          supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'new'),
          supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'under_review'),
          supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
          supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'published'),
          supabase.from('companies').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
          supabase.from('countries').select('id', { count: 'exact', head: true }).eq('active', true)
        ]);

      setStats({
        applicants: applicants.count ?? 0,
        newApplications: newApplications.count ?? 0,
        pendingReview: pendingReview.count ?? 0,
        pendingPayments: pendingPayments.count ?? 0,
        confirmedPayments: confirmedPayments.count ?? 0,
        jobs: jobs.count ?? 0,
        pendingCompanies: pendingCompanies.count ?? 0,
        countries: countries.count ?? 0
      });
      setLoading(false);
    }
    load();
  }, []);

  const cards: { label: string; value: number; to: string }[] = [
    { label: 'إجمالي المتقدمين', value: stats.applicants, to: '/admin/applicants' },
    { label: 'الطلبات الجديدة', value: stats.newApplications, to: '/admin/applicants' },
    { label: 'الطلبات قيد المراجعة', value: stats.pendingReview, to: '/admin/applicants' },
    { label: 'المدفوعات المعلقة', value: stats.pendingPayments, to: '/admin/payments' },
    { label: 'المدفوعات المؤكدة', value: stats.confirmedPayments, to: '/admin/payments' },
    { label: 'الوظائف المنشورة', value: stats.jobs, to: '/admin/jobs' },
    { label: 'شركات بانتظار الموافقة', value: stats.pendingCompanies, to: '/admin/companies' },
    { label: 'الدول النشطة', value: stats.countries, to: '/admin/countries' }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar active="dashboard" />
      <main className="flex-1 p-6">
        <h1 className="mb-1 text-xl font-extrabold text-navy">لوحة التحكم</h1>
        <p className="mb-6 text-sm text-slate-500">نظرة عامة على منصة فرصتك</p>

        {!isSupabaseConfigured && (
          <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
            لوحة الإدارة غير متصلة بقاعدة بيانات حقيقية بعد — الأرقام أدناه صفرية إلى أن يتم إعداد Supabase (راجع README.md).
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {cards.map((c) => (
            <Link key={c.label} to={c.to} className="rounded-2xl bg-white p-4 shadow-card transition hover:shadow-cardHover">
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className="mt-2 text-2xl font-extrabold text-navy">{loading ? '—' : c.value}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
    }
