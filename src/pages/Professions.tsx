import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '../components/BottomNavigation';
import { SearchBar } from '../components/SearchBar';
import { fetchProfessions } from '../services/catalogService';
import { Profession } from '../types';

export default function Professions() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Profession[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfessions().then((d) => {
      setItems(d);
      setLoading(false);
    });
  }, []);

  const filtered = items.filter((p) => !query || p.name.includes(query.trim()));

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="flex items-center gap-3 bg-navy px-4 py-4 text-white">
        <button onClick={() => navigate(-1)} aria-label="رجوع">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">المهن والحرف</h1>
      </div>

      <div className="mx-4 mt-4">
        <SearchBar placeholder="ابحث عن مهنة..." value={query} onChange={setQuery} />
      </div>

      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        {loading && <p className="col-span-2 py-10 text-center text-sm text-slate-400">جاري التحميل...</p>}
        {!loading && filtered.length === 0 && (
          <p className="col-span-2 py-10 text-center text-sm text-slate-400">لا توجد مهن حاليًا.</p>
        )}
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/jobs?q=${encodeURIComponent(p.name)}`)}
            className="rounded-2xl border border-slate-100 bg-white p-4 text-right shadow-card"
          >
            <p className="font-bold text-navy">{p.name}</p>
            {p.category && <p className="mt-1 text-xs text-slate-400">{p.category}</p>}
          </button>
        ))}
      </div>

      <BottomNavigation />
    </div>
  );
}
