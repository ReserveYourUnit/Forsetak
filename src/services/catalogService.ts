import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { DEMO_COUNTRIES, DEMO_JOBS, DEMO_PROFESSIONS } from '../lib/demoData';
import { Country, Job, Profession } from '../types';

export async function fetchCountries(): Promise<Country[]> {
  if (!isSupabaseConfigured) return DEMO_COUNTRIES;
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('active', true)
    .order('featured', { ascending: false });
  if (error) {
    console.error('fetchCountries error', error);
    return [];
  }
  return data as Country[];
}

export async function fetchProfessions(): Promise<Profession[]> {
  if (!isSupabaseConfigured) return DEMO_PROFESSIONS;
  const { data, error } = await supabase
    .from('professions')
    .select('*')
    .eq('active', true)
    .order('name');
  if (error) {
    console.error('fetchProfessions error', error);
    return [];
  }
  return data as Profession[];
}

export interface CompanyItem {
  id: string;
  name: string;
  field?: string | null;
  description?: string | null;
  country?: { name: string; flag_url: string } | null;
}

export async function fetchCompanies(): Promise<CompanyItem[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, field, description, country:countries(name, flag_url)')
    .eq('verification_status', 'approved')
    .order('name');
  if (error) {
    console.error('fetchCompanies error', error);
    return [];
  }
  return (data ?? []) as unknown as CompanyItem[];
}

export interface JobFilters {
  countryId?: string;
  professionId?: string;
  query?: string;
}

const JOB_SELECT = '*, country:countries(id, name, flag_url), company:companies(name)';

function mapJob(row: any): Job {
  return {
    ...row,
    company_name: row.company?.name ?? '',
    city: row.city_name ?? '',
    salary_min: Number(row.salary_min) || 0,
    salary_max: Number(row.salary_max) || 0,
    contract_type: row.contract_type ?? '',
    description: row.description ?? '',
    requirements: row.requirements ?? [],
    benefits: row.benefits ?? [],
    country: row.country ?? { id: '', name: '', flag_url: '' }
  } as Job;
}

export async function fetchJobs(filters: JobFilters = {}): Promise<Job[]> {
  if (!isSupabaseConfigured) {
    return DEMO_JOBS.filter((j) => {
      if (filters.countryId && j.country.id !== filters.countryId) return false;
      if (filters.professionId && j.profession_id !== filters.professionId) return false;
      if (filters.query) {
        const q = filters.query.trim();
        if (q && !`${j.title} ${j.company_name} ${j.country.name} ${j.city}`.includes(q)) return false;
      }
      return true;
    });
  }
  let q = supabase
    .from('jobs')
    .select(JOB_SELECT)
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (filters.countryId) q = q.eq('country_id', filters.countryId);
  if (filters.professionId) q = q.eq('profession_id', filters.professionId);
  if (filters.query && filters.query.trim()) q = q.ilike('title', `%${filters.query.trim()}%`);
  const { data, error } = await q;
  if (error) {
    console.error('fetchJobs error', error);
    return [];
  }
  return (data ?? []).map(mapJob);
}

export async function fetchJobById(id: string): Promise<Job | undefined> {
  if (!isSupabaseConfigured) return DEMO_JOBS.find((j) => j.id === id);
  const { data, error } = await supabase.from('jobs').select(JOB_SELECT).eq('id', id).single();
  if (error) {
    console.error('fetchJobById error', error);
    return undefined;
  }
  return mapJob(data);
}
