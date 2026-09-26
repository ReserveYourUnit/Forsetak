import { Link } from 'react-router-dom';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-navy px-4 py-3 text-white shadow-card">
      <button aria-label="القائمة" className="rounded-full p-2 hover:bg-white/10">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>
      <Link to="/" className="flex items-center gap-2">
        <img src="/assets/logo.png" alt="فرصتك" className="h-9 w-9 rounded-full object-cover" />
        <span className="text-lg font-bold">فرصتك</span>
      </Link>
      <Link to="/notifications" aria-label="الإشعارات" className="relative rounded-full p-2 hover:bg-white/10">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" />
        </svg>
        <span className="absolute -top-0.5 -left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber text-[10px] font-bold text-navy">
          3
        </span>
      </Link>
    </header>
  );
}
