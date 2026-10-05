import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchJobById } from '../services/catalogService';
import { Job } from '../types';

const PERKS = [
  { key: 'flight_ticket', label: 'تذاكر سفر', icon: '✈️' },
  { key: 'accommodation', label: 'سكن منوّر', icon: '🏠' },
  { key: 'insurance', label: 'تأمين منوّر', icon: '🛡️' },
  { key: 'visa_support', label: 'دعم تأشيرة', icon: '📄' }
] as const;

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | undefined>(undefined);

  useEffect(() => {
    if (id) fetchJobById(id).then(setJob);
  }, [id]);

  if (!job) {
    return <div className="p-6 text-center text-sm text-slate-400">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="flex items-center gap-3 bg-navy px-4 py-4 text-white">
        <button onClick={() => navigate(-1)} aria-label="رجوع">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="truncate text-lg font-bold">{job.title}</h1>
      </div>
      <div className="mx-4 -mt-2 mt-4 rounded-2xl bg-white p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-2xl">{job.country.flag_url}</div>
          <div>
            <h2 className="font-bold text-navy">{job.title}</h2>
            <p className="text-sm text-slate-500">{job.company_name}</p>
            <p className="text-xs text-slate-400">
              {job.country.name} · {job.city}
            </p>
          </div>
        </div>
        <p className="mt-3 text-lg font-extrabold text-sky">
          {job.salary_min.toLocaleString()} {job.currency} - {job.salary_max.toLocaleString()} {job.currency}
        </p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {PERKS.filter((p) => job[p.key]).map((p) => (
            <div key={p.key} className="flex flex-col items-center gap-1 rounded-xl bg-slate-50 py-3 text-center">
              <span className="text-lg">{p.icon}</span>
              <span className="text-[11px] font-medium text-slate-500">{p.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-card">
        <h3 className="mb-2 font-bold text-navy">وصف الوظيفة</h3>
        <p className="text-sm leading-relaxed text-slate-600">{job.description}</p>
      </div>
      {job.requirements.length > 0 && (
        <div className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-card">
          <h3 className="mb-2 font-bold text-navy">المتطلبات</h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
            {job.requirements.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
      {job.benefits.length > 0 && (
        <div className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-card">
          <h3 className="mb-2 font-bold text-navy">المميزات</h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
            {job.benefits.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="fixed bottom-0 inset-x-0 z-20 border-t border-slate-200 bg-white p-4">
        <button
          onClick={() => navigate(`/apply/${job.id}`)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-4 text-base font-bold text-white shadow-cardHover"
        >
          قدّم الآن
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
