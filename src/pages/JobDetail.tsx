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

  const hasSalary = typeof job.salary_min === 'number' && typeof job.salary_max === 'number';
  const requirements = job.requirements ?? [];
  const benefits = job.benefits ?? [];

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
