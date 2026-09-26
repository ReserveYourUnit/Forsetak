import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BottomNavigation } from '../components/BottomNavigation';
import { SearchBar } from '../components/SearchBar';
import { FilterChip } from '../components/Chips';
import { JobCard } from '../components/JobCard';
import { fetchCountries, fetchJobs } from '../services/catalogService';
import { Country, Job } from '../types';

export default function Jobs() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [countries, setCountries] = useState<Country[]>([]);
  const [countryId, setCountryId] = useState<string | undefined>(undefined);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCountries().then(setCountries);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchJobs({ countryId, query }).then((data) => {
      setJobs(data);
      setLoading(false);
    });
  }, [countryId, query]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="flex items-center gap-3 bg-navy px-4 py-4 text-white">
        <button onClick={() => navigate(-1)} aria-label="رجوع">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">الوظائف</h1>
      </div>

      <div className="mx-4 mt-4">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <FilterChip label="جميع الدول" active={!countryId} onClick={() => setCountryId(undefined)} />
        {countries.map((c) => (
          <FilterChip key={c.id} label={`${c.flag_url} ${c.name}`} active={countryId === c.id} onClick={() => setCountryId(c.id)} />
        ))}
      </div>

      <div className="mx-4 mt-4 flex flex-col gap-3">
        {loading && <p className="py-10 text-center text-sm text-slate-400">جاري تحميل الوظائف...</p>}
        {!loading && jobs.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">لا توجد وظائف مطابقة حاليًا لبحثك.</p>
        )}
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      <BottomNavigation />
    </div>
  );
}
