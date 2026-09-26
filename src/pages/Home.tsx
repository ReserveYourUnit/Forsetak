import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { BottomNavigation } from '../components/BottomNavigation';
import { SearchBar } from '../components/SearchBar';
import { JobCard } from '../components/JobCard';
import { fetchJobs } from '../services/catalogService';
import { Job } from '../types';

const QUICK_LINKS = [
  { to: '/jobs', label: 'الوظائف', icon: '💼' },
  { to: '/professions', label: 'المهن والحرف', icon: '🛠️' },
  { to: '/companies', label: 'الشركات الأجنبية', icon: '🏢' },
  { to: '/countries', label: 'اختر دولتك', icon: '🌍' },
  { to: '/my-applications', label: 'تقديم الطلبات', icon: '📄' },
  { to: '/tips', label: 'نصائح السفر والعمل', icon: '✈️' }
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs().then((data) => setJobs(data.slice(0, 4)));
  }, []);

  function onSearchSubmit() {
    navigate(`/jobs?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <AppHeader />

      <div className="mx-4 mt-4 overflow-hidden rounded-2xl bg-gradient-to-l from-navy to-navy-500 p-5 text-white shadow-card">
        <h2 className="text-xl font-extrabold leading-relaxed">فرص عمل حقيقية في دول العالم</h2>
        <p className="mt-2 text-sm text-slate-200">
          اختر مهنتك واختر دولتك وابدأ طريقك للسفر والعمل.
        </p>
      </div>

      <div className="mx-4 mt-4" onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}>
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div className="mx-4 mt-5 grid grid-cols-3 gap-3">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white py-4 text-center shadow-card"
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="text-xs font-semibold text-navy">{link.label}</span>
          </Link>
        ))}
      </div>

      <div className="mx-4 mt-6 flex items-center justify-between">
        <h3 className="font-bold text-navy">أحدث الفرص</h3>
        <Link to="/jobs" className="text-sm font-medium text-sky">
          عرض الكل
        </Link>
      </div>
      <div className="mx-4 mt-3 flex flex-col gap-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      <BottomNavigation />
    </div>
  );
}
