import { NavLink } from 'react-router-dom';

const items = [
  { to: '/more', label: 'المزيد', icon: 'grid' },
  { to: '/my-applications', label: 'طلباتي', icon: 'file' },
  { to: '/jobs', label: 'البحث', icon: 'search' },
  { to: '/', label: 'الرئيسية', icon: 'home', end: true }
];

function Icon({ name }: { name: string }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 };
  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 11l9-8 9 8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
      );
    case 'file':
      return (
        <svg {...common}>
          <path d="M6 2h9l5 5v15H6z" strokeLinejoin="round" />
          <path d="M9 13h6M9 17h6" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
  }
}

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 grid grid-cols-4 border-t border-slate-200 bg-white px-2 py-1.5 shadow-[0_-2px_12px_rgba(11,37,69,0.08)]">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-medium ${
              isActive ? 'text-sky' : 'text-slate-400'
            }`
          }
        >
          <Icon name={item.icon} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
