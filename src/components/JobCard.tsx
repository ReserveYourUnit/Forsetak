import { Link } from 'react-router-dom';
import { Job } from '../types';

export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-card transition hover:shadow-cardHover"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-2xl">
        {job.country.flag_url}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-bold text-navy">{job.title}</h3>
          <button aria-label="حفظ" className="shrink-0 text-slate-300 hover:text-amber">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-slate-500">{job.company_name}</p>
        <p className="text-xs text-slate-400">
          {job.country.name} · {job.city}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-sky">
            {job.salary_min.toLocaleString()} {job.currency} - {job.salary_max.toLocaleString()} {job.currency}
          </span>
          <span className="rounded-full bg-navy-50 px-2.5 py-1 text-[11px] font-medium text-navy-600">{job.contract_type}</span>
        </div>
      </div>
    </Link>
  );
}
