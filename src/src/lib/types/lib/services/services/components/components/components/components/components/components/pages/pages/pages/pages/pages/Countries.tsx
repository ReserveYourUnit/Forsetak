import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { FilterChip } from '../components/Chips';
import { CountryCard } from '../components/CountryCard';
import { BottomNavigation } from '../components/BottomNavigation';
import { fetchCountries } from '../services/catalogService';
import { Country } from '../types';

const REGION_TABS = [
  { key: 'featured', label: 'الأكثر طلبًا' },
  { key: 'arab', label: 'دول الخليج' },
  { key: 'europe', label: 'أوروبا' },
  { key: 'other', label: 'باقي الدول' }
] as const;

export default function Countries() {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<Country[]>([]);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<(typeof REGION_TABS)[number]['key']>('featured');
  const [selected, setSelected] = useState<string | undefined>();

  useEffect(() => {
    fetchCountries().then(setCountries);
  }, []);

  const filtered = useMemo(() => {
    return countries.filter((c) => {
      if (query && !c.name.includes(query)) return false;
      if (region === 'featured') return c.featured;
      return c.region === region;
    });
  }, [countries, query, region]);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="flex items-center gap-3 bg-navy px-4 py-4 text-white">
        <button onClick={() => navigate(-1)} aria-label="رجوع">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">اختر الدولة</h1>
      </div>

      <div className="mx-4 mt-4">
        <SearchBar placeholder="ابحث عن دولة" value={query} onChange={setQuery} />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {REGION_TABS.map((tab) => (
          <FilterChip key={tab.key} label={tab.label} active={region === tab.key} onClick={() => setRegion(tab.key)} />
        ))}
      </div>

      <div className="mx-4 mt-4 grid grid-cols-3 gap-3">
        {filtered.map((c) => (
          <CountryCard key={c.id} country={c} selected={selected === c.id} onSelect={() => setSelected(c.id)} />
        ))}
      </div>

      <div className="fixed bottom-16 inset-x-0 z-20 border-t border-slate-200 bg-white p-4">
        <button
          disabled={!selected}
          onClick={() => navigate(`/jobs?country=${selected}`)}
          className="w-full rounded-2xl bg-navy py-4 text-base font-bold text-white shadow-cardHover disabled:opacity-40"
        >
          تأكيد الاختيار
        </button>
      </div>

      <BottomNavigation />
    </div>
  );
}
