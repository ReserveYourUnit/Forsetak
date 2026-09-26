import { useNavigate } from 'react-router-dom';

export function SimplePage({ title, description }: { title: string; description: string }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="flex items-center gap-3 bg-navy px-4 py-4 text-white">
        <button onClick={() => navigate(-1)} aria-label="رجوع">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">{title}</h1>
      </div>
      <div className="mx-4 mt-10 text-center text-sm text-slate-400">{description}</div>
    </div>
  );
}
