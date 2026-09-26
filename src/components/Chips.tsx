export function FilterChip({
  label,
  active,
  onClick
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
        active ? 'border-navy bg-navy text-white' : 'border-slate-200 bg-white text-slate-500'
      }`}
    >
      {label}
    </button>
  );
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-sky-100 text-sky-600',
  awaiting_fee: 'bg-amber-100 text-amber-600',
  payment_confirmed: 'bg-emerald-100 text-emerald-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-600',
  closed: 'bg-slate-100 text-slate-500'
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-500'}`}>
      {label}
    </span>
  );
}
