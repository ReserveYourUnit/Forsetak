import { Country } from '../types';

export function CountryCard({ country, onSelect, selected }: { country: Country; onSelect?: () => void; selected?: boolean }) {
  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center gap-2 rounded-2xl border bg-white p-4 shadow-card transition ${
        selected ? 'border-sky ring-2 ring-sky/30' : 'border-slate-100'
      }`}
    >
      <span className="text-3xl">{country.flag_url}</span>
      <span className="text-sm font-semibold text-navy">{country.name}</span>
    </button>
  );
}
